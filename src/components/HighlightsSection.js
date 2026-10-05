import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { GatsbyImage, getImage } from "gatsby-plugin-image";
import { SafeHtmlParser } from "./SafeHtmlParser";

const HighlightsSection = ({
	backgroundColour,
	subheadingAbove,
	subheadingColour,
	heading,
	description,
	highlights,
	primaryCtaButton,
	secondaryCta,
	headingTextColour,
	descriptionTextColour,
	primaryCtaButtonColour,
	primaryCtaTextColour,
	primaryCtaButtonHoverColour,
	primaryCtaTextHoverColour,
	secondaryCtaTextColour,
	secondaryCtaChevronColour,
	customCss
}) => {
	return (
		<section 
			className="highlights-section py-5 py-lg-5"
			style={{ backgroundColor: backgroundColour }}
		>
			<Container className="highlights-content-container">
				<Row>
					<Col xs={12}>
						<div className="highlights-text-container text-center mb-5">
							{subheadingAbove && (
								<p
									className="highlights-subheading-above mb-2"
									style={{ color: subheadingColour }}
								>
									{subheadingAbove}
								</p>
							)}
                            {heading && (
								<h2 
									className="highlights-heading mb-0"
									style={{ color: headingTextColour }}
								>
									{heading}
								</h2>
							)}
							{description && (
								<p 
									className="highlights-description my-3 mx-auto" 
									style={{maxWidth: '800px', color: descriptionTextColour}}
								>
									{description}
								</p>
							)}
							
						</div>
					</Col>
				</Row>
				
				{highlights && highlights.length > 0 && (
					<Row className="g-4 mb-7 justify-content-center">
						{/* First highlight - centered on tablet/desktop */}
							{highlights[0] && (
							<Col 
								xs={12} 
								md={12} 
								lg={4} 
								className="d-md-flex d-lg-block justify-content-md-center"
							>
								<div className="highlights-item text-center h-100 px-3">
									{highlights[0].icon && (
										<div className="highlights-icon-container mb-4">
											{highlights[0].icon?.mimeType === "image/svg+xml" ? (
												<img
													src={highlights[0].icon.localFile?.publicURL || highlights[0].icon.sourceUrl}
													alt={highlights[0].icon?.altText || "Highlight icon"}
													className="highlight-svg-icon"
												
												/>
											) : getImage(highlights[0].icon?.localFile) ? (
												<GatsbyImage
													image={getImage(highlights[0].icon?.localFile)}
													alt={highlights[0].icon?.altText || "Highlight icon"}
													className="highlight-image-icon"
												/>
											) : (
												<img
													src={highlights[0].icon.sourceUrl}
													alt={highlights[0].icon?.altText || "Highlight icon"}
													className="highlight-fallback-icon"
													
												/>
											)}
										</div>
									)}
									{highlights[0].heading && (
										<h3 
											className="highlights-item-heading mb-3"
											style={{ color: highlights[0].headingColour }}
										>
											{highlights[0].heading}
										</h3>
									)}
									{highlights[0].description && (
										<SafeHtmlParser
											className="highlights-item-description mb-0"
											style={{ color: highlights[0].descriptionColour }}
											htmlContent={highlights[0].description}
										/>
									)}
									{highlights[0].ctaText?.title && (
										<a href={highlights[0].ctaText.url} target={highlights[0].ctaText.target || '_self'} className="highlights-item-cta-text mt-2 d-inline-flex align-items-center text-decoration-none" style={{ color: highlights[0].ctaTextColour }}>
											{highlights[0].ctaText.title}
											{highlights[0].ctaChevronColour && (
												<svg className="ms-1" width="16" height="16" viewBox="0 0 24 24" fill={highlights[0].ctaChevronColour}>
													<path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
												</svg>
											)}
										</a>
									)}
								</div>
							</Col>
						)}
						
						{/* Remaining highlights - two columns on tablet */}
						{highlights.slice(1).map((highlight, index) => {
							const iconImage = getImage(highlight.icon?.localFile);
							const isSvg = highlight.icon?.mimeType === "image/svg+xml";
							
							return (
								<Col 
									xs={12} 
									md={6} 
									lg={4} 
									key={index + 1}
								>
									<div className="highlights-item text-center h-100 px-3">
										{highlight.icon && (
											<div className="highlights-icon-container mb-4">
												{isSvg ? (
													<img
														src={highlight.icon.localFile?.publicURL || highlight.icon.sourceUrl}
														alt={highlight.icon?.altText || "Highlight icon"}
														className="highlight-svg-icon"
														
													/>
												) : iconImage ? (
													<GatsbyImage
														image={iconImage}
														alt={highlight.icon?.altText || "Highlight icon"}
														className="highlight-image-icon"
													/>
												) : (
													<img
														src={highlight.icon.sourceUrl}
														alt={highlight.icon?.altText || "Highlight icon"}
														className="highlight-fallback-icon"
														
													/>
												)}
											</div>
										)}
										{highlight.heading && (
											<h3 
												className="highlights-item-heading mb-3"
												style={{ color: highlight.headingColour }}
											>
												{highlight.heading}
											</h3>
										)}
										{highlight.description && (
										<SafeHtmlParser
											className="highlights-item-description mb-0"
											style={{ color: highlight.descriptionColour }}
											htmlContent={highlight.description}
										/>
										)}
										{highlight.ctaText?.title && (
											<a href={highlight.ctaText.url} target={highlight.ctaText.target || '_self'} className="highlights-item-cta-text mt-2 d-inline-flex align-items-center text-decoration-none" style={{ color: highlight.ctaTextColour }}>
												{highlight.ctaText.title}
												{highlight.ctaChevronColour && (
													<svg className="ms-1" width="16" height="16" viewBox="0 0 24 24" fill={highlight.ctaChevronColour}>
														<path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
													</svg>
												)}
											</a>
										)}
									</div>
								</Col>
							);
						})}
					</Row>
				)}
				
				{primaryCtaButton && primaryCtaButton.title && (
					<Row>
						<Col xs={12} className="text-center">
							<Button 
								className="highlights-primary-cta-button btn-primary px-3 py-3 me-3"
								style={{
									...(primaryCtaButtonColour && { backgroundColor: primaryCtaButtonColour, borderColor: primaryCtaButtonColour }),
									...(primaryCtaTextColour && { color: primaryCtaTextColour })
								}}
								href={primaryCtaButton.url}
								target={primaryCtaButton.target || "_self"}
							>
								{primaryCtaButton.title}
							</Button>
							{secondaryCta && secondaryCta.title && (
								<Button
									variant="btn-link"
									className="highlights-secondary-cta-button p-0 text-decoration-none d-inline-flex align-items-center ms-3"
									href={secondaryCta.url}
									target={secondaryCta.target || "_self"}
									style={{ color: secondaryCtaTextColour }}
								>
									{secondaryCta.title}
									<svg className="ms-1" width="16" height="16" viewBox="0 0 24 24" fill={secondaryCtaChevronColour || secondaryCtaTextColour}>
										<path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
									</svg>
								</Button>
							)}
						</Col>
					</Row>
				)}
			</Container>
			
			<style>{`
				 .highlights-primary-cta-button:hover {
        background-color: ${primaryCtaButtonHoverColour || 'var(--primary-cta-hover-colour)'} !important;
        border-color: ${primaryCtaButtonHoverColour || 'var(--primary-cta-hover-colour)'} !important;
        color: ${primaryCtaTextHoverColour || 'var(--primary-cta-hover-text-colour)'} !important;
    }

				.highlights-item-cta-text:hover {
					color: #ffffff !important;
				}
				.highlights-item-cta-text:hover svg {
					fill: #ffffff !important;
				}
				
				.highlight-svg-icon,
				.highlight-image-icon,
				.highlight-fallback-icon {
					width: 40px;
					height: 40px;
					object-fit: contain;
					opacity: 0.8;
				}
				.highlight-image-icon {
					width: 40px !important;
					height: 40px !important;
				}
				@media (min-width: 768px) {
					.highlight-svg-icon,
					.highlight-image-icon,
					.highlight-fallback-icon {
						width: 48px;
						height: 48px;
					}
					.highlight-image-icon {
						width: 48px !important;
						height: 48px !important;
					}
				}
				@media (min-width: 992px) {
					.highlight-svg-icon,
					.highlight-image-icon,
					.highlight-fallback-icon {
						width: 49px;
						height: 49px;
					}
					.highlight-image-icon {
						width: 49px !important;
						height: 49px !important;
					}
					.highlights-item-heading {
						font-size: 36px !important;}
				}
				
				
			`}</style>
			{customCss && (
				<style>{`${customCss}`}</style>
			)}
		</section>
	);
};

export default HighlightsSection;