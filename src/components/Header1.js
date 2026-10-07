// Header1.js
import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { GatsbyImage, getImage } from "gatsby-plugin-image";
import { SafeHtmlParser } from "./SafeHtmlParser";
import { Link } from "gatsby";
import { FaArrowRightLong } from "react-icons/fa6";

const Header1 = ({ 
	backgroundImage, 
	subheadingAbove,
	heading, 
	description,
	primaryCtaButton,
	secondaryCtaButton,
	frameFullHeight,
	backgroundColour,
	subheadingAboveColour,
	headingTextColour,
	descriptionTextColour,
	customCss,
	primaryCtaButtonColour,
	primaryCtaTextColour,
	primaryCtaButtonHoverColour,
	primaryCtaTextHoverColour,
	secondaryCtaButtonColour,
	secondaryCtaTextColour
}) => {
	const renderImage = (img) => {
		if (!img) return null;

		const gatsbyImg = getImage(img.localFile?.childImageSharp);
		return (
			<GatsbyImage
				className="w-100"
				image={gatsbyImg}
				alt={img.altText || "Header background"}
			/>
		);
	};

	return (
		<section
			className={`header1-section position-relative d-flex flex-column py-lg-9 py-6 ${frameFullHeight ? 'header1-section--full-height' : ''}`}
			style={{
				background: backgroundColour
			}}
		>
			{backgroundImage && (() => {
				const isSvg = backgroundImage.mimeType === "image/svg+xml" || backgroundImage.localFile?.extension === 'svg';
				const bgImage = getImage(backgroundImage.localFile?.childImageSharp);
				const svgUrl = backgroundImage.localFile?.publicURL || backgroundImage.sourceUrl;

				return (
					<div className="position-absolute top-0 start-0 w-100 h-100" style={{ zIndex: 1 }}>
						{isSvg ? (
							<img
								src={svgUrl}
								alt={backgroundImage?.altText || "Header background"}
								className="w-100 h-100"
								style={{ objectFit: 'cover' }}
							/>
						) : bgImage ? (
							<GatsbyImage
								className="w-100 h-100"
								image={bgImage}
								alt={backgroundImage?.altText || "Header background"}
								style={{ objectFit: 'cover' }}
							/>
						) : null}
					</div>
				);
			})()}
			
			<Container className="header1-content-container flex-fill d-flex align-items-center justify-content-start" style={{ zIndex: 2 }}>
				<Row className="w-100">
					<Col xs={12} md={9} lg={8} className="text-start">
						<div className="header1-text-container">
							{subheadingAbove && (
								<p className="header1-subheading-above mb-2" style={{ color: subheadingAboveColour }}>
									{subheadingAbove}
								</p>
							)}
							{heading && (
								<h1 className="header1-heading" style={{ color: headingTextColour }}>
									{heading}
								</h1>
							)}
							{description && (
								<p 
									className="header1-description mt-3 "
									style={{ color: descriptionTextColour }}
								>
									{description}
								</p>
							)}
							{primaryCtaButton && primaryCtaButton.url && (
								<Button 
									as={primaryCtaButton.url.startsWith('/') ? Link : 'a'}
									to={primaryCtaButton.url.startsWith('/') ? primaryCtaButton.url : undefined}
									href={!primaryCtaButton.url.startsWith('/') ? primaryCtaButton.url : undefined}
									target={primaryCtaButton.target || '_self'}
									variant="primary"
								className="header1-primary-cta-button btn-primary py-3 px-3 mt-3 me-3"
								size="lg"
								style={{
									...(primaryCtaButtonColour && { backgroundColor: primaryCtaButtonColour, borderColor: primaryCtaButtonColour }),
									...(primaryCtaTextColour && { color: primaryCtaTextColour })
								}}
								>
									{primaryCtaButton.title}
								</Button>
							)}
							{secondaryCtaButton && secondaryCtaButton.url && (
								<Button 
									as={secondaryCtaButton.url.startsWith('/') ? Link : 'a'}
									to={secondaryCtaButton.url.startsWith('/') ? secondaryCtaButton.url : undefined}
									href={!secondaryCtaButton.url.startsWith('/') ? secondaryCtaButton.url : undefined}
									target={secondaryCtaButton.target || '_self'}
									variant="outline-primary"
									className="header1-secondary-cta-button py-3 px-3 mt-3"
									size="lg"
									style={{
										...(secondaryCtaButtonColour && { borderColor: secondaryCtaButtonColour }),
										...(secondaryCtaTextColour && { color: secondaryCtaTextColour })
									}}
								>
									{secondaryCtaButton.title}
								</Button>
							)}
						</div>
					</Col>
				</Row>
			</Container>
			<style>{`
				.header1-section {
					min-height: 35vh;
				}

				@media (min-width: 1200px) {
					.header1-section--full-height {
						min-height: 50vh;
					}
				}

				.header1-primary-cta-button:hover {
					background-color: ${primaryCtaButtonHoverColour || 'var(--primary-cta-hover-colour)'} !important;
					border-color: ${primaryCtaButtonHoverColour || 'var(--primary-cta-hover-colour)'} !important;
					color: ${primaryCtaTextHoverColour || 'var(--primary-cta-hover-text-colour)'} !important;
				}

				@media (max-width: 575.98px) {
					.header1-section [data-gatsby-image-wrapper] img {
						object-position: left center !important;
					}
				}

				@media (min-width: 576px) and (max-width: 767.98px) {
					.header1-section [data-gatsby-image-wrapper] img {
						object-position: left center !important;
					}
				}

				@media (min-width: 768px) and (max-width: 991.98px) {
					.header1-section [data-gatsby-image-wrapper] img {
						object-position: right center !important;
					}
				}
			`}</style>
			{customCss && (
				<style>{`${customCss}`}</style>
			)}
		</section>
	);
};

export default Header1;
