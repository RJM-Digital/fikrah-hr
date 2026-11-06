const path = require("path");
const https = require("https");
const { slash } = require(`gatsby-core-utils`);

let gtmConfig = { enabled: false, id: null };

const GTM_COMPONENT_QUERY = `{
	component(id: "google-tag-manager", idType: SLUG) {
		googleTagManagerFields {
			enableGtm
			headScript
			bodyScript
		}
	}
}`;

const wpGraphqlRequest = (url, query) => new Promise((resolve, reject) => {
	const body = JSON.stringify({ query });
	const req = https.request(url, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Content-Length": Buffer.byteLength(body),
		},
	}, (res) => {
		if (res.statusCode < 200 || res.statusCode >= 300) {
			res.resume();
			reject(new Error(`WordPress returned HTTP ${res.statusCode}.`));
			return;
		}

		let data = "";
		res.setEncoding("utf8");
		res.on("data", (chunk) => { data += chunk; });
		res.on("error", reject);
		res.on("aborted", () => reject(new Error("WordPress response was aborted.")));
		res.on("end", () => {
			try {
				resolve(JSON.parse(data));
			} catch (error) {
				reject(new Error(`Invalid WordPress JSON response: ${error.message}`));
			}
		});
	});
	const timeout = setTimeout(() => {
		req.destroy(new Error("WordPress GTM request timed out after 15 seconds."));
	}, 15000);
	req.on("close", () => clearTimeout(timeout));
	req.on("error", reject);
	req.end(body);
});

const extractGtmContainerIds = (snippet) => {
	if (typeof snippet !== "string") return [];
	return (snippet.match(/GTM-[A-Z0-9]+/gi) || []).map((id) => id.toUpperCase());
};

exports.onPreBootstrap = async ({ reporter }) => {
	gtmConfig = { enabled: false, id: null };
	const wpUrl = process.env.WPGRAPHQL_URL || "https://fikrah-hr.rjmdigital.net/graphql";

	try {
		const result = await wpGraphqlRequest(wpUrl, GTM_COMPONENT_QUERY);
		if (Array.isArray(result?.errors) && result.errors.length > 0) {
			throw new Error(result.errors.map((error) => error?.message || "Unknown GraphQL error").join(" | "));
		}

		const fields = result?.data?.component?.googleTagManagerFields;
		if (!fields) {
			throw new Error('WordPress component "google-tag-manager" was not found.');
		}
		if (fields.enableGtm !== true) return;

		const headIds = extractGtmContainerIds(fields.headScript);
		const bodyIds = extractGtmContainerIds(fields.bodyScript);
		if (headIds.length !== 1 || bodyIds.length !== 1 || headIds[0] !== bodyIds[0]) {
			throw new Error("Enabled Google Tag Manager requires exactly one matching container ID in both the head and body snippets.");
		}

		gtmConfig = { enabled: true, id: headIds[0] };
	} catch (error) {
		reporter.warn(`Google Tag Manager configuration failed: ${error.message} GTM output remains disabled.`);
	}
};

exports.onCreateWebpackConfig = ({ actions, plugins }) => {
	actions.setWebpackConfig({
		plugins: [
			plugins.define({
				__GTM_CONFIG__: JSON.stringify(gtmConfig),
			}),
		],
	});
};

// A simple slugify function for creating URL-friendly strings
const slugify = (text) =>
	text
		.toString()
		.toLowerCase()
		.trim()
		.replace(/\s+/g, "-") // Replace spaces with -
		.replace(/&/g, "-and-") // Replace & with 'and'
		.replace(/[^\w\-]+/g, "") // Remove all non-word chars
		.replace(/\-\-+/g, "-"); // Replace multiple - with single -

exports.createPages = async ({ actions, graphql }) => {
	const { createPage, createRedirect } = actions;

	// Available templates
	const blogTemplate = path.resolve(`src/templates/post.js`);
	const policyTemplate = path.resolve(`src/templates/policy.js`);
	const pageTemplate = path.resolve(`src/templates/page.js`);
	const answerTemplate = path.resolve(`src/templates/answer.js`);
	const quizTemplate = path.resolve(`src/templates/quiz.js`);

	// Query all the data
	const {
		data: {
			allWpPage: { nodes: allPages },
			allWpPost: { nodes: allPosts },
			allWpPolicy: { nodes: allPolicy },
			allWpFaq: { nodes: allFaqs },
			allWpQuiz: { nodes: allQuizzes },
		},
	} = await graphql(`
		query {
			allWpPage(filter: { slug: { nin: ["home", "support"] } }) {
				nodes {
					id
					slug
				}
			}
			allWpPolicy {
				nodes {
					id
					slug
				}
			}
			allWpPost {
				nodes {
					id
					slug
				}
			}
			allWpFaq {
				nodes {
					id
					slug
				}
			}
			allWpQuiz {
				nodes {
					id
					slug
				}
			}
		}
	`);

	// Create pages for each content type
	allPages.forEach((page) => {
		createPage({
			path: page.slug,
			component: slash(pageTemplate),
			context: { id: page.id },
		});
	});

	allPosts.forEach((page) => {
		createPage({
			path: `blog/${page.slug}`,
			component: slash(blogTemplate),
			context: { id: page.id },
		});
	});

	allPolicy.forEach((policy) => {
		createPage({
			path: `policies/${policy.slug}`,
			component: slash(policyTemplate),
			context: { id: policy.id },
		});
	});

	allFaqs.forEach((faq) => {
		createPage({	
			path: `your-questions/${faq.slug}`,
			component: slash(answerTemplate),
			context: { id: faq.id },
		});
	});

	allQuizzes.forEach((quiz) => {
		createPage({
			path: `quiz/${quiz.slug}`,
			component: slash(quizTemplate),
			context: { id: quiz.id },
		});
	});

	// Create redirects
	createRedirect({
		fromPath: `/admin`,
		toPath: `https://fikrah-hr.rjmdigital.net/wp-login.php`,
		isPermanent: true,
	});
	createRedirect({
		fromPath: `/sitemap`,
		toPath: `/sitemap/sitemap-0.xml`,
		isPermanent: true,
	});
	createRedirect({
		fromPath: `/home`,
		toPath: `/`,
		isPermanent: true,
	});
	
};
