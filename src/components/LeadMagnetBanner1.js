import React, { useState } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { Link } from "gatsby";
import { GatsbyImage, getImage } from "gatsby-plugin-image";
import { SafeHtmlParser } from "./SafeHtmlParser";

const LeadMagnetBanner1 = ({
	backgroundColour,
	sectionLayout,
	image,
	heading,
	description,
	cta,
	disclaimer,
	redirectUrl,
	webhookUrl,
	field1PlaceholderText,
	field2PlaceholderText,
	hideInputFields,
	headingTextColour,
	descriptionTextColour,
	customCss,
	disclaimerTextColour,
	ctaButtonColour,
	ctaButtonTextColour,
	ctaButtonHoverColour,
	ctaButtonTextHoverColour
}) => {
	const bannerImage = getImage(image?.localFile);
	const [field1Value, setField1Value] = useState('');
	const [field2Value, setField2Value] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!field1Value || !field2Value || !webhookUrl) return;

		setIsSubmitting(true);
		try {
			const res = await fetch(webhookUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ 
					[field1PlaceholderText || "Name"]: field1Value, 
					[field2PlaceholderText || "Email"]: field2Value 
				}),
			});
			if (!res.ok) {
				const bodyText = await res.text();
				throw new Error(`Webhook responded ${res.status}: ${bodyText}`);
			}
			// success — clear fields and redirect
			setField1Value('');
			setField2Value('');
			if (redirectUrl) {
				window.open(redirectUrl, '_blank');
			}
		} catch (error) {
			console.error('Form submission error:', error);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<section 
			className="leadmagnet1-section py-7"
			style={{ backgroundColor: backgroundColour }}
		>
			<Container className="leadmagnet1-content-container">
				<Row className="align-items-center">
					<Col xs={12} lg={6} className={`mb-6 mb-lg-0 ${sectionLayout ? 'order-lg-1' : 'order-lg-2'}`}>
						{bannerImage && (
							<GatsbyImage
								image={bannerImage}
								alt={image?.altText || "Lead magnet"}
								className="leadmagnet1-image lead-magnet-image"
							/>
						)}
					</Col>
					<Col xs={12} lg={6} className={sectionLayout ? 'order-lg-2' : 'order-lg-1'}>
						<div className="leadmagnet1-text-container lead-magnet-content">
							{heading && (
								<h3 className="leadmagnet1-heading text-center pb-3" style={{color: headingTextColour}}>
									<SafeHtmlParser htmlContent={heading} />
								</h3>
							)}
							{description && (
								<div className="leadmagnet1-description text-center">
									<SafeHtmlParser className="leadmagnet1-description-html" style={{color: descriptionTextColour}} htmlContent={description} />
								</div>
							)}
							
							{!hideInputFields && (
								<Form className="leadmagnet1-form lead-magnet-form pt-4" onSubmit={handleSubmit}>
									<Row>										
										<Col xs={12} xl={6}>
											<Form.Group className="mb-3">
											<Form.Control
												type="text"
												placeholder={field1PlaceholderText}
												required
                                                    className="py-3"
												value={field1Value}
												onChange={(e) => setField1Value(e.target.value)}
											/>
											</Form.Group>
										</Col>
                                        <Col xs={12} xl={6}>
											<Form.Group className="mb-3">
											<Form.Control
												type="email"
												placeholder={field2PlaceholderText}
												required
                                                    className="py-3"
												value={field2Value}
												onChange={(e) => setField2Value(e.target.value)}
											/>
											</Form.Group>
										</Col>
                                        <Col xs={12}>
                                        {cta && cta.title && (
										<Button 
											type="submit" 
											className="btn-primary leadmagnet1-cta-button py-3 px-3 w-100"
											disabled={isSubmitting}
											style={{color: ctaButtonTextColour, backgroundColor: ctaButtonColour}}
										>
											{isSubmitting ? 'Submitting...' : cta.title}
										</Button>
									)}
                                        </Col>
									</Row>
									
								</Form>
							)}

							{hideInputFields && cta && cta.title && (
								<div className="my-3 mx-auto text-center">
									<Button 
										as={cta.url?.startsWith('/') ? Link : 'a'}
										to={cta.url?.startsWith('/') ? cta.url : undefined}
										href={cta.url?.startsWith('/') ? undefined : cta.url}
										target={cta.target || (cta.url?.startsWith('/') ? undefined : '_blank')}
										className="btn-primary leadmagnet1-cta-button px-3 py-3"
										style={{color: ctaButtonTextColour, backgroundColor: ctaButtonColour}}
									>
										{cta.title}
									</Button>
								</div>
							)}

							{disclaimer && !hideInputFields && (
								<div className="lead-magnet-disclaimer pt-3">
									<SafeHtmlParser className="" htmlContent={disclaimer} style={{color: disclaimerTextColour}} />
								</div>
							)}
						</div>
					</Col>
				</Row>
			</Container>
			<style>{`
				.leadmagnet1-cta-button:hover {
					background-color: ${ctaButtonHoverColour || 'var(--primary-cta-hover-colour)'} !important;
					border-color: ${ctaButtonHoverColour || 'var(--primary-cta-hover-colour)'} !important;
					color: ${ctaButtonTextHoverColour || 'var(--primary-cta-hover-text-colour)'} !important;
				}
			`}</style>
			{customCss && (
				<style>{`${customCss}`}</style>
			)}
		</section>
	);
};

export default LeadMagnetBanner1;