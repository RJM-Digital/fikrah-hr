import { GatsbyImage } from "gatsby-plugin-image";
import React from "react";
import { Col, Container, Row } from "react-bootstrap";
import { SafeHtmlParser } from "./SafeHtmlParser";

const BlogContentSection = ({ wpPage, styling }) => {

	return (
		<div>
			<Row className=" justify-content-center">
				{/* Left Column: Main Content */}
				<Col xs={12} className="blog-inner-content">
					<SafeHtmlParser className="blog-inner-content" htmlContent={wpPage.content} />
				</Col>

				{/* Right Column: "Spread the word" & Categories */}
				<Col xs={12}>
					<div
						style={{
							borderBottom: `1px solid ${wpPage.blogFields.colour}`,
						}}
						className="pt-5"
					>
						<Row className="align-items-start">
							<Col xs={12} md={2} xl={1} className="mb-4 mb-lg-0 me-xl-3">
							{wpPage.blogFields.authorImage?.localFile?.childImageSharp
							?.gatsbyImageData && (
							<GatsbyImage
								className="author-image"
								image={
									wpPage.blogFields.authorImage.localFile.childImageSharp
										.gatsbyImageData
								}
								alt={wpPage.blogFields.authorImage?.altText || "Author Image"}
								style={{
									width: "60px",
									height: "60px",
									borderRadius: "50px",
								}}
							/>
						)}
							</Col>
							<Col xs={12} md={10} xl={9}>
								<div className="d-flex align-items-center justify-content-center justify-content-md-start">
						
						<div className="d-block">
							<h6 className="blog-post-author-name pb-0 mb-0" style={{color: styling.authorNameTextColour}}>
								{wpPage?.author?.node?.name}
							</h6>
							<p className="blog-post-author-description" style={{color: styling.authorDescriptionTextColour}}>{wpPage?.author?.node?.description}</p>
							
						</div>
					</div>
							</Col>
						</Row>
						<hr className="blog-post-hr mb-0 mt-5"/>
					</div>
				</Col>
			</Row>
		</div>
	);
};

export default BlogContentSection;
