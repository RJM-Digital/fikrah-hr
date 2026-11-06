const React = require("react");

const DISABLED_GTM_CONFIG = { enabled: false, id: null };
const GTM_ID_PATTERN = /^GTM-[A-Z0-9]+$/;

const consentInitialization = `
window.dataLayer = window.dataLayer || [];
function gtag(){window.dataLayer.push(arguments);}
window.clarity = window.clarity || function(){
  (window.clarity.q = window.clarity.q || []).push(arguments);
};
gtag('consent', 'default', {
  analytics_storage: 'denied',
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied'
});
if (document.cookie.split(';').some(function(cookie) {
  return cookie.trim() === 'CookieConsent=true';
})) {
  gtag('consent', 'update', {
    analytics_storage: 'granted',
    ad_storage: 'granted',
    ad_user_data: 'granted',
    ad_personalization: 'granted'
  });
  window.clarity('consentv2', {
    ad_Storage: 'granted',
    analytics_Storage: 'granted'
  });
} else {
  window.clarity('consentv2', {
    ad_Storage: 'denied',
    analytics_Storage: 'denied'
  });
}
`;

const createGtmLoaderScript = (id) => `
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${id}');
`;

exports.onRenderBody = ({ setHeadComponents, setPreBodyComponents }) => {
	const config = typeof __GTM_CONFIG__ === "undefined"
		? DISABLED_GTM_CONFIG
		: __GTM_CONFIG__;

	if (config?.enabled !== true || typeof config.id !== "string" || !GTM_ID_PATTERN.test(config.id)) {
		return;
	}

	setHeadComponents([
		React.createElement("script", {
			key: "gtm-consent-initialization",
			dangerouslySetInnerHTML: { __html: consentInitialization },
		}),
		React.createElement("script", {
			key: "gtm-loader",
			dangerouslySetInnerHTML: { __html: createGtmLoaderScript(config.id) },
		}),
	]);

	setPreBodyComponents([
		React.createElement(
			"noscript",
			{ key: "gtm-noscript" },
			React.createElement("iframe", {
				src: `https://www.googletagmanager.com/ns.html?id=${config.id}`,
				height: "0",
				width: "0",
				style: { display: "none", visibility: "hidden" },
			})
		),
	]);
};
