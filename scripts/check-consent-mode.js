#!/usr/bin/env node

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { EventEmitter } = require("node:events");
const { createRequire } = require("node:module");
const React = require("react");
const { transformSync } = require("@babel/core");
const CookieConsent = require("react-cookie-consent").default;

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const plain = (value) => JSON.parse(JSON.stringify(value));
const googleConsent = (value) => ({
	analytics_storage: value,
	ad_storage: value,
	ad_user_data: value,
	ad_personalization: value,
});
const clarityConsent = (value) => ({
	ad_Storage: value,
	analytics_Storage: value,
});

const loadModule = (file, globals = {}, overrides = {}, transpile = false) => {
	const localRequire = createRequire(path.join(root, file));
	const module = { exports: {} };
	const source = transpile ? transformSync(read(file), {
		babelrc: false,
		configFile: false,
		presets: ["@babel/preset-react"],
		plugins: ["@babel/plugin-transform-modules-commonjs"],
	}).code : read(file);
	const context = {
		module,
		exports: module.exports,
		require: (name) => Object.prototype.hasOwnProperty.call(overrides, name)
			? overrides[name] : localRequire(name),
		...globals,
	};
	vm.runInNewContext(source, context, { filename: file });
	return module.exports;
};

async function checkBootstrap() {
	let response;
	let pendingTimeout;
	let requestUrl;
	let requestBody;
	let cleared = 0;
	const node = loadModule("gatsby-node.js", {
		Buffer,
		process: { env: {} },
		setTimeout(callback, delay) {
			assert.equal(delay, 15000);
			pendingTimeout = callback;
			return 1;
		},
		clearTimeout() { cleared += 1; },
	}, {
		https: {
			request(url, options, callback) {
				requestUrl = url;
				assert.equal(options.method, "POST");
				const req = new EventEmitter();
				req.destroy = (error) => {
					req.emit("error", error);
					req.emit("close");
				};
				req.end = (body) => {
					requestBody = JSON.parse(body);
					process.nextTick(() => {
						if (response.timeout) {
							pendingTimeout();
							return;
						}
						if (response.error) {
							req.destroy(new Error(response.error));
							return;
						}
						const res = new EventEmitter();
						res.statusCode = response.status || 200;
						res.resume = () => {};
						res.setEncoding = (encoding) => assert.equal(encoding, "utf8");
						callback(res);
						if (response.aborted) {
							res.emit("aborted");
						} else if (response.streamError) {
							res.emit("error", new Error(response.streamError));
						} else {
							res.emit("data", response.raw ?? JSON.stringify(response.payload));
							res.emit("end");
						}
						req.emit("close");
					});
				};
				return req;
			},
		},
	});

	const config = () => {
		let result;
		node.onCreateWebpackConfig({
			actions: { setWebpackConfig: (value) => { result = value; } },
			plugins: { define: (value) => value },
		});
		return JSON.parse(result.plugins[0].__GTM_CONFIG__);
	};
	const valid = {
		enableGtm: true,
		headScript: "<script>('gtm-ab12cd')</script>",
		bodyScript: '<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-AB12CD"></iframe></noscript>',
	};
	const fieldsResponse = (fields) => ({ payload: { data: { component: { googleTagManagerFields: fields } } } });
	const run = async (value) => {
		response = value;
		const warnings = [];
		const previousCleared = cleared;
		await node.onPreBootstrap({ reporter: { warn: (message) => warnings.push(message) } });
		assert.equal(cleared, previousCleared + 1, "Request deadline must be cleared.");
		return warnings;
	};

	assert.deepEqual(await run(fieldsResponse(valid)), []);
	assert.deepEqual(config(), { enabled: true, id: "GTM-AB12CD" });
	assert.equal(requestUrl, "https://fikrah-hr.rjmdigital.net/graphql");
	assert.match(requestBody.query, /component\(id: "google-tag-manager", idType: SLUG\)/);
	assert.deepEqual(await run(fieldsResponse({ enableGtm: false })), []);
	assert.deepEqual(config(), { enabled: false, id: null });

	const failures = [
		fieldsResponse(null),
		fieldsResponse({ ...valid, headScript: "" }),
		fieldsResponse({ ...valid, bodyScript: null }),
		fieldsResponse({ ...valid, bodyScript: "GTM-OTHER" }),
		fieldsResponse({ ...valid, headScript: "GTM-AB12CD GTM-AB12CD" }),
		{ payload: { errors: [{ message: "GraphQL unavailable" }] } },
		{ payload: {} },
		{ status: 503 },
		{ raw: "<html>Not JSON</html>" },
		{ error: "Connection failed" },
		{ aborted: true },
		{ streamError: "Response failed" },
		{ timeout: true },
	];
	for (const failure of failures) {
		await run(fieldsResponse(valid));
		const warnings = await run(failure);
		assert.equal(warnings.length, 1, "Every configuration/fetch failure must warn.");
		assert.match(warnings[0], /GTM output remains disabled/);
		assert.deepEqual(config(), { enabled: false, id: null }, "Never reuse stale GTM configuration.");
	}
}

function renderSsr(config) {
	const ssr = loadModule("gatsby-ssr.js", config === undefined ? {} : { __GTM_CONFIG__: config });
	let head = [];
	let body = [];
	ssr.onRenderBody({
		setHeadComponents: (value) => { head = value; },
		setPreBodyComponents: (value) => { body = value; },
	});
	return { head, body };
}

function checkSsr() {
	for (const config of [undefined, null, {}, { enabled: false, id: "GTM-AB12CD" }, { enabled: true, id: "invalid" }, { enabled: true, id: "GTM-A';alert(1)" }]) {
		assert.deepEqual(renderSsr(config), { head: [], body: [] });
	}
	const { head, body } = renderSsr({ enabled: true, id: "GTM-AB12CD" });
	assert.equal(head.length, 2);
	assert.equal(body.length, 1);
	assert.equal(body[0].type, "noscript");
	assert.equal(body[0].props.children.type, "iframe");
	assert.equal(body[0].props.children.props.src, "https://www.googletagmanager.com/ns.html?id=GTM-AB12CD");

	for (const cookie of ["", "CookieConsent=false", "CookieConsent=invalid", "OtherCookieConsent=true", "CookieConsent=true", "other=1;CookieConsent=true; another=2"]) {
		const accepted = cookie.split(";").some((entry) => entry.trim() === "CookieConsent=true");
		const inserted = [];
		const window = {};
		const document = {
			cookie,
			createElement: (type) => { assert.equal(type, "script"); return {}; },
			getElementsByTagName: () => [{ parentNode: {
				insertBefore(script) {
					assert.deepEqual(plain(window.dataLayer[0][2]), googleConsent("denied"));
					assert.deepEqual(plain(window.clarity.q[0][1]), clarityConsent(accepted ? "granted" : "denied"));
					inserted.push(script);
				},
			} }],
		};
		const context = vm.createContext({ window, document });
		for (const script of head) {
			vm.runInContext(script.props.dangerouslySetInnerHTML.__html, context);
		}
		assert.equal(window.dataLayer[0][0], "consent");
		assert.equal(window.dataLayer[0][1], "default");
		assert.equal(window.dataLayer.length, accepted ? 3 : 2);
		if (accepted) {
			assert.equal(window.dataLayer[1][1], "update");
			assert.deepEqual(plain(window.dataLayer[1][2]), googleConsent("granted"));
		}
		assert.equal(window.dataLayer.at(-1).event, "gtm.js");
		assert.equal(inserted.length, 1);
		assert.equal(inserted[0].src, "https://www.googletagmanager.com/gtm.js?id=GTM-AB12CD");
	}
}

function checkBannerAndRoutes() {
	for (const savedChoice of [undefined, "true", "false"]) {
		const window = {};
		const state = [];
		let cursor = 0;
		let effect;
		const hooks = {
			...React,
			useState(initial) {
				const index = cursor++;
				if (!(index in state)) state[index] = initial;
				return [state[index], (value) => { state[index] = value; }];
			},
			useEffect(callback) { effect = callback; },
		};
		const Banner = loadModule("src/components/Cookie.js", { window }, {
			react: hooks,
			"react-cookie-consent": {
				__esModule: true,
				default: CookieConsent,
				Cookies: { get: () => savedChoice },
			},
		}, true).default;
		const render = () => {
			cursor = 0;
			return React.Children.toArray(Banner().props.children);
		};
		render();
		effect();
		let children = render();
		assert.equal(children.some((child) => child.type === "button"), savedChoice !== undefined);
		let consent = children.find((child) => child.type === CookieConsent);
		assert.equal(consent.props.cookieName, "CookieConsent");
		assert.equal(consent.props.expires, 365);
		assert.equal(consent.props.visible, "byCookieValue");
		assert.equal(React.Children.toArray(consent.props.children).find((child) => child.type === "a").props.href, "/policies/cookie-policy");

		// Exercise the installed consent component's cookie writes and our callbacks together.
		const originalDocument = Object.getOwnPropertyDescriptor(global, "document");
		const originalLocation = Object.getOwnPropertyDescriptor(global, "location");
		let cookieWrites = [];
		try {
			Object.defineProperty(global, "document", {
				configurable: true,
				value: { get cookie() { return savedChoice ? `CookieConsent=${savedChoice}` : ""; }, set cookie(value) { cookieWrites.push(value); } },
			});
			Object.defineProperty(global, "location", { configurable: true, value: { protocol: "https:" } });
			const instance = new CookieConsent(consent.props);
			instance.setState = (value) => { instance.state = { ...instance.state, ...value }; };
			instance.componentDidMount();
			assert.equal(instance.render() !== null, savedChoice === undefined);
			instance.accept();
			assert(cookieWrites.some((value) => value.startsWith("CookieConsent=true;")));
			assert.equal(instance.render(), null);

			children = render();
			const manage = children.find((child) => child.type === "button");
			assert.equal(manage.props["aria-label"], "Manage cookies");
			assert.equal(manage.props.type, "button");
			const beforeManage = window.dataLayer.length;
			manage.props.onClick();
			children = render();
			assert.equal(window.dataLayer.length, beforeManage, "Opening preferences must not change consent.");
			consent = children.find((child) => child.type === CookieConsent);
			assert.equal(consent.props.visible, "show");
			instance.props = consent.props;
			assert.notEqual(instance.render(), null);
			cookieWrites = [];
			instance.decline();
			assert(cookieWrites.some((value) => value.startsWith("CookieConsent=false;")));
			instance.props = render().find((child) => child.type === CookieConsent).props;
			assert.equal(instance.render(), null);
			instance.accept();
		} finally {
			if (originalDocument) Object.defineProperty(global, "document", originalDocument);
			else delete global.document;
			if (originalLocation) Object.defineProperty(global, "location", originalLocation);
			else delete global.location;
		}
		assert.deepEqual(plain(window.dataLayer.filter((entry) => entry[0] === "consent").map((entry) => entry[2])), [
			googleConsent("granted"), googleConsent("denied"), googleConsent("granted"),
		]);
		assert.equal(window.dataLayer.filter((entry) => entry.event === "cookie_consent_granted").length, 2);
		assert.deepEqual(plain(window.clarity.q.map((entry) => entry[1])), [
			clarityConsent("granted"), clarityConsent("denied"), clarityConsent("granted"),
		]);
	}

	const window = {};
	const browser = loadModule("gatsby-browser.js", { window, document: { title: "Test page" } }, {
		"./src/styles/global.scss": {},
	}, true);
	const location = { href: "https://example.test/page?q=1#section", pathname: "/page", search: "?q=1", hash: "#section" };
	browser.onRouteUpdate({ location });
	assert.deepEqual(plain(window.dataLayer), [{
		event: "gatsby-route-change",
		page_location: location.href,
		page_path: "/page?q=1#section",
		page_title: "Test page",
	}]);
}

async function main() {
	const layout = read("src/components/Layout.js");
	assert.match(layout, /import CookieBanner from "\.\/Cookie"/);
	assert.doesNotMatch(layout, /WpGtmHead|WpGtmBody|@connorrjm\/rjm-cookie-banner/);
	for (const file of ["src/utls/WpGtmHead.js", "src/utls/WpGtmBody.js"]) {
		assert.equal(fs.existsSync(path.join(root, file)), false);
	}
	assert.equal(JSON.parse(read("package.json")).dependencies["@connorrjm/rjm-cookie-banner"], undefined);
	assert.equal(JSON.parse(read("package-lock.json")).packages["node_modules/@connorrjm/rjm-cookie-banner"], undefined);
	assert.doesNotMatch(read("src/components/Cookie.js"), /window\.location\.reload/);
	await checkBootstrap();
	checkSsr();
	checkBannerAndRoutes();
	console.log("Consent Mode checks passed: bootstrap failures, SSR execution, saved consent, banner choices, cookie writes and route payloads.");
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
