const path = require("path");
const { slash } = require(`gatsby-core-utils`);

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
