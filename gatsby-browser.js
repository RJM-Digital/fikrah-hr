import "./src/styles/global.scss";

export const onRouteUpdate = ({ location }) => {
	window.dataLayer = window.dataLayer || [];

	window.dataLayer.push({
		event: "gatsby-route-change",
		page_location: location.href,
		page_path: `${location.pathname}${location.search}${location.hash}`,
		page_title: document.title,
	});
};
