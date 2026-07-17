import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { GatsbyImage, getImage } from "gatsby-plugin-image";
import { SafeHtmlParser } from "./SafeHtmlParser";
import Link from "./Link";

const LogoImage = ({ logo }) => {
	const logoImage = getImage(logo?.localFile);
	const isSvg = logo?.mimeType === "image/svg+xml";
	const logoSrc = logo?.localFile?.publicURL || logo?.sourceUrl;
	const logoAlt = logo?.altText || "Company logo";

	if (isSvg && logoSrc) {
		return (
			<img
				src={logoSrc}
				alt={logoAlt}
				className="as-seen-in-logo"
				style={{ maxHeight: "60px", maxWidth: "160px", objectFit: "contain" }}
			/>
		);
	}
	if (logoImage) {
		return (
			<GatsbyImage
				image={logoImage}
				alt={logoAlt}
				className="as-seen-in-logo"
				imgStyle={{ objectFit: "contain" }}
				style={{ maxHeight: "60px" }}
			/>
		);
	}
	if (logoSrc) {
		return (
			<img
				src={logoSrc}
				alt={logoAlt}
				className="as-seen-in-logo"
				style={{ maxHeight: "60px", maxWidth: "160px", objectFit: "contain" }}
			/>
		);
	}
	return null;
};

const LogoItem = ({ logoItem }) => {
	const logoUrl = logoItem.companyUrl?.url;
	const wrapper = (
		<div className="as-seen-in-logo-wrapper d-flex justify-content-center align-items-center px-4">
			<LogoImage logo={logoItem.companyLogo} />
		</div>
	);

	if (logoUrl) {
		return (
			<Link
				to={logoUrl}
				target={logoItem.companyUrl?.target || "_blank"}
				rel="noopener noreferrer"
				className="as-seen-in-logo-link d-block"
			>
				{wrapper}
			</Link>
		);
	}
	return wrapper;
};

const AsSeenIn = ({
	subheading,
	heading,
	bodyText,
	logos,
	backgroundColour,
	subheadingColour,
	headingColour,
	bodyTextColour,
	customCss
}) => {
	const hasLogos = logos && logos.length > 0;
	const duplicated = hasLogos ? [...logos, ...logos] : [];

	return (
		<section
			className="as-seen-in-section py-5 py-lg-7"
			style={{ backgroundColor: backgroundColour }}
		>
			<style>{`
				.as-seen-in-marquee-track {
					overflow: hidden;
					width: 100%;
				}
				.as-seen-in-marquee-inner {
					display: flex;
					width: max-content;
					align-items: center;
				}
				.as-seen-in-marquee-inner.scroll-left {
					animation: asisMarqueeLeft 80s linear infinite;
				}
				.as-seen-in-marquee-inner.scroll-right {
					animation: asisMarqueeRight 80s linear infinite;
				}
				@keyframes asisMarqueeLeft {
					0%   { transform: translateX(0); }
					100% { transform: translateX(-50%); }
				}
				@keyframes asisMarqueeRight {
					0%   { transform: translateX(-50%); }
					100% { transform: translateX(0); }
				}
				.as-seen-in-marquee-track:hover .as-seen-in-marquee-inner {
					animation-play-state: paused;
				}
			`}</style>

			<Container className="as-seen-in-content-container">
				<Row className="justify-content-center text-center mb-5">
					<Col xs={12} lg={8}>
						{subheading && (
							<p
								className="as-seen-in-subheading mb-2"
								style={{ color: subheadingColour }}
							>
								{subheading}
							</p>
						)}
						{heading && (
							<h2
								className="as-seen-in-heading mb-3"
								style={{ color: headingColour }}
							>
								{heading}
							</h2>
						)}
						{bodyText && (
							<div
								className="as-seen-in-body-text"
								style={{ color: bodyTextColour }}
							>
								<SafeHtmlParser htmlContent={bodyText} />
							</div>
						)}
					</Col>
				</Row>
			</Container>

			{hasLogos && (
				<div className="as-seen-in-marquee-track">
					<div className="as-seen-in-marquee-inner scroll-left">
						{duplicated.map((logoItem, i) => (
							<LogoItem key={i} logoItem={logoItem} />
						))}
					</div>
				</div>
			)}

			{customCss && <style>{`${customCss}`}</style>}
		</section>
	);
};

export default AsSeenIn;
