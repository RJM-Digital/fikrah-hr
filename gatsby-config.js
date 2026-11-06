const url = "https://www.fikrahhr.com";

module.exports = {
	siteMetadata: {
		title: "Fikrah HR",
		siteUrl: url,
		company: "Fikrah HR",
	},
	plugins: [
		"gatsby-plugin-sass",
		"gatsby-plugin-image",
		`gatsby-plugin-netlify`,

		{
			resolve: `gatsby-source-wordpress`,

			options: {
				production: {
					allow404Images: true,
				},
				url:
					// allows a fallback url if WPGRAPHQL_URL is not set in the env, this may be a local or remote WP instance.
					process.env.WPGRAPHQL_URL ||
					"https://fikrah-hr.rjmdigital.net/graphql",
				schema: {
					//Prefixes all WP Types with "Wp" so "Post and allPost" become "WpPost and allWpPost".
					typePrefix: `Wp`,
					// Reduce nodes per request to lower memory/CPU per request
					perPage: 20,
					// Increase timeout (ms) for slow WP endpoints — adjust as needed
					timeout: 300000,
				},
				html: {
					imageQuality: 100,
					useGatsbyImage: false,
					generateWebpImages: true,
				},
				develop: {
					//caches media files outside of Gatsby's default cache an thus allows them to persist through a cache reset.
					hardCacheMediaFiles: true,
					hardCacheData: true,
					nodeUpdateInterval: 30000,
				},
				type: {
					Post: {
						limit: process.env.NODE_ENV === `development` ? 50 : 5000,
					},
					
				},
			},
		},
		"gatsby-plugin-react-helmet",

		"gatsby-plugin-next-seo",
		"gatsby-plugin-sitemap",
		{
			resolve: "gatsby-plugin-robots-txt",
			options: {
				host: url,
				sitemap: `${url}/sitemap/sitemap-index.xml`,
			},
		},
		{
			resolve: "gatsby-plugin-manifest",
			options: {
				name: `example`,
				short_name: `example`,
				start_url: `/`,
				background_color: `#00000`,
				theme_color: `#00000`,
				display: `standalone`,
				icon: "src/images/favicon-fikrah.svg",
				cache_busting_mode: "none",
			},
		},
		
		"gatsby-plugin-sharp",
		"gatsby-transformer-sharp",
		{
			resolve: `gatsby-plugin-react-helmet-canonical-urls`,
			options: {
				siteUrl: url,
				noTrailingSlash: false,
			},
		},
		{
			resolve: "gatsby-source-filesystem",
			options: {
				name: "images",
				path: "src/images",
			},
			__key: "images",
		},
		{
			resolve: "gatsby-source-filesystem",
			options: {
				name: "pages",
				path: "src/pages",
			},
			__key: "pages",
		},
	],
};
