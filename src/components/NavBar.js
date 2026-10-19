import React, { useState } from "react";
import { Navbar, Nav, Button, NavDropdown, Container } from "react-bootstrap";
import { Link, useStaticQuery, graphql } from "gatsby";

const NavBar = ({ hideLinks }) => {
	const [showMobileMenu, setShowMobileMenu] = useState(false);

	const data = useStaticQuery(graphql`
		query {
			navbar: wpComponent(slug: { eq: "navbar" }) {
				navbarFields {
					backgroundColour
					customCss
					textColour
					sticky
					logo {
						altText
						sourceUrl
						localFile {
							publicURL
						}
					}
					primaryCta {
						title
						url
						target
					}
					primaryCtaColour
					primaryCtaTextColour
					primaryCtaTextHoverColour
					primaryCtaHoverColour
					secondaryCta {
						title
						url
						target
					}
					secondaryCtaColour
					secondaryCtaTextColour
					secondaryCtaTextHoverColour
					secondaryCtaHoverColour
					navDropdownLinkColour
					links {
						label
						type
						link {
							title
							url
							target
						}
						dropdownLinks {
							links {
								title
								url
								target
							}
						}
					}
				}
			}
		}
	`);

	const navbar = data.navbar?.navbarFields;

	const displayText = (text) => typeof text === "string" ? text.replace(/&amp;/g, "&") : text;

	const toggleMobileMenu = () => {
		setShowMobileMenu(!showMobileMenu);
	};

	const getNavbarStyle = () => {
		if (navbar?.backgroundColour) {
			return { backgroundColor: navbar.backgroundColour };
		}
		return { backgroundColor: '#ffffff' };
	};

	const getTextColor = () => {
		if (navbar?.textColour) {
			return { color: navbar.textColour };
		}
		return navbar?.backgroundColour && navbar.backgroundColour !== '#ffffff' ? { color: '#ffffff' } : { color: '#000000' };
	};

	const renderNavLink = (link, index) => {
    // Normalize dropdown items to a flat array supporting multiple shapes:
    // - link.dropdownLinks.links (object with links array)
    // - link.dropdownLinks (array)
    // - items where the actual data lives under .link or .links
    if (link.type === "Dropdown") {
        // helper to produce a flat array of candidate items
        const dropdownItems = (() => {
            if (!link.dropdownLinks) return [];
            // case: { dropdownLinks: { links: [ ... ] } }
            if (Array.isArray(link.dropdownLinks?.links)) return link.dropdownLinks.links;
            // case: { dropdownLinks: [ ... ] }
            if (Array.isArray(link.dropdownLinks)) return link.dropdownLinks;
            // fallback: maybe it's an object with keys (unlikely) -> return empty
            return [];
        })();

        // if no items, bail
        if (!dropdownItems || dropdownItems.length === 0) return null;

        return (
            <NavDropdown
                /* render the title as a node so the toggle text gets the inline style */
                title={<span style={getTextColor()}>{displayText(link.label)}</span>}
                id={`nav-dropdown-${index}`}
                key={index}
                className="me-4"
                style={getTextColor()}
            >
                {dropdownItems.map((item, dropdownIndex) => {
                    // item might be { title, url, target } or { link: { title, url, target } } or { links: { title, url, target } }
                    const title = item?.title || item?.link?.title || item?.links?.title || "";
                    const url = item?.url || item?.link?.url || item?.links?.url || "";
                    const target = item?.target || item?.link?.target || item?.links?.target || "";

                    if (!title && !url) return null;

                    const isInternal = typeof url === "string" && url.startsWith("/");

                    return (
                        <NavDropdown.Item
                            key={dropdownIndex}
                            as={isInternal ? Link : "a"}
                            to={isInternal ? url : undefined}
                            href={isInternal ? undefined : url}
                            style={{ color: navbar.NavDropdownLinkColour }}
                            target={target || (isInternal ? undefined : "_blank")}
                        >
                            {displayText(title)}
                        </NavDropdown.Item>
                    );
                })}
            </NavDropdown>
        );
    }

    // Regular link
    if (link.link?.url) {
        return (
            <Nav.Link
                key={index}
                as={link.link.url.startsWith("/") ? Link : "a"}
                to={link.link.url.startsWith("/") ? link.link.url : undefined}
                href={link.link.url.startsWith("/") ? undefined : link.link.url}
                target={link.link.target || (link.link.url.startsWith("/") ? undefined : "_blank")}
                className="me-4"
                style={getTextColor()}
            >
                {displayText(link.link.title)}
            </Nav.Link>
        );
    }

    return null;
	};

	return (
		<>
			{/* Navigation */}
			<Navbar
				expand="xl"
				id="navbar-test"
				className={navbar.sticky ? 'sticky-top' : ''}
				style={{ ...getNavbarStyle(), borderBottom: '1px solid #E83166' }}
			>
				<Container>
					{/* Brand/Logo */}
					
						<Navbar.Brand as={Link} to="/">
							<img 
								src={navbar.logo?.localFile?.publicURL || navbar.logo?.sourceUrl}
								alt={navbar.logo?.altText || "Logo"}
								style={{ height: "50px" }}
							/>
						</Navbar.Brand>
					

					{!hideLinks && (
						<>
							{/* Mobile Toggle */}
							<Navbar.Toggle 
								aria-controls="basic-navbar-nav"
								onClick={toggleMobileMenu}
								className="border-0"
							/>

							{/* Navigation Links */}
							<Navbar.Collapse id="basic-navbar-nav">
								<Nav className="ms-auto align-items-center">
									{navbar?.links?.map((link, index) => renderNavLink(link, index))}
							
									{/* CTA Buttons - Desktop (side by side) */}
									<div className="d-none d-xl-flex gap-3">
										

										{/* Primary CTA */}
										{navbar?.primaryCta?.url && (
											<Button
												as={navbar.primaryCta.url.startsWith('/') ? Link : 'a'}
												to={navbar.primaryCta.url.startsWith('/') ? navbar.primaryCta.url : undefined}
												href={navbar.primaryCta.url.startsWith('/') ? undefined : navbar.primaryCta.url}
												target={navbar.primaryCta.target || (navbar.primaryCta.url.startsWith('/') ? undefined : '_blank')}
												variant="primary"
												className="navbar-primary-cta text-nowrap py-2 px-3 me-xl-2"
												style={{ 
													backgroundColor: navbar.primaryCtaColour,
													borderColor: navbar.primaryCtaColour,
													color: navbar.primaryCtaTextColour,
													fontSize: '1rem',
												}}
											>
												{displayText(navbar.primaryCta.title)}
											</Button>
										)}
										{/* Secondary CTA */}
										{navbar?.secondaryCta?.url && (
											<Button
												as={navbar.secondaryCta.url.startsWith('/') ? Link : 'a'}
												to={navbar.secondaryCta.url.startsWith('/') ? navbar.secondaryCta.url : undefined}
												href={navbar.secondaryCta.url.startsWith('/') ? undefined : navbar.secondaryCta.url}
												target={navbar.secondaryCta.target || (navbar.secondaryCta.url.startsWith('/') ? undefined : '_blank')}
												className="navbar-secondary-cta py-2 px-3"
												style={{ 
													background: navbar.secondaryCtaColour,
													color: navbar.secondaryCtaTextColour,
													borderColor: navbar.secondaryCtaColour
												}}
											>
												{displayText(navbar.secondaryCta.title)}
											</Button>
										)}
									</div>

									{/* CTA Buttons - Mobile/Tablet (stacked) */}
									<div className="d-xl-none w-100 mt-3">
										{/* Secondary CTA */}
										{navbar?.secondaryCta?.url && (
											<div className="mb-2">
												<Button
													as={navbar.secondaryCta.url.startsWith('/') ? Link : 'a'}
													to={navbar.secondaryCta.url.startsWith('/') ? navbar.secondaryCta.url : undefined}
													href={navbar.secondaryCta.url.startsWith('/') ? undefined : navbar.secondaryCta.url}
													target={navbar.secondaryCta.target || (navbar.secondaryCta.url.startsWith('/') ? undefined : '_blank')}
												className="navbar-secondary-cta w-100 py-2 px-3"
													style={{ 
														backgroundColor: navbar.secondaryCtaColour,
														color: navbar.secondaryCtaTextColour,
														borderColor: navbar.secondaryCtaColour												
													}}
												>
													{displayText(navbar.secondaryCta.title)}
												</Button>
											</div>
										)}

										{/* Primary CTA */}
										{navbar?.primaryCta?.url && (
											<div className="mb-2">
												<Button
													as={navbar.primaryCta.url.startsWith('/') ? Link : 'a'}
													to={navbar.primaryCta.url.startsWith('/') ? navbar.primaryCta.url : undefined}
													href={navbar.primaryCta.url.startsWith('/') ? undefined : navbar.primaryCta.url}
													target={navbar.primaryCta.target || (navbar.primaryCta.url.startsWith('/') ? undefined : '_blank')}
													variant="primary"
												className="navbar-primary-cta w-100 py-2 px-3"
													style={{ 
														backgroundColor: navbar.primaryCtaColour,
														borderColor: navbar.primaryCtaColour,
														color: navbar.primaryCtaTextColour													
												
													}}
													>
													{displayText(navbar.primaryCta.title)}
												</Button>
											</div>
										)}
									</div>
								</Nav>
							</Navbar.Collapse>
						</>
					)}
					
				</Container>
			</Navbar>

			<style>{`
				.navbar-toggler {
					border-top-color: ${navbar?.textColour || (navbar?.backgroundColour && navbar.backgroundColour !== '#ffffff' ? '#ffffff' : '#000000')} !important;
				}
				.navbar-toggler-icon {
					background-image: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30'><path stroke='${encodeURIComponent(navbar?.textColour || (navbar?.backgroundColour && navbar.backgroundColour !== '#ffffff' ? '#ffffff' : '#000000'))}' stroke-linecap='round' stroke-miterlimit='10' stroke-width='2' d='M4 7h22M4 15h22M4 23h22'/></svg>") !important;
				}
			.navbar-primary-cta:hover {
				background-color: ${navbar?.primaryCtaHoverColour || 'var(--primary-cta-hover-colour)'} !important;
				border-color: ${navbar?.primaryCtaHoverColour || 'var(--primary-cta-hover-colour)'} !important;
				color: ${navbar?.primaryCtaTextHoverColour || 'var(--primary-cta-hover-text-colour)'} !important;
			}
			.navbar-secondary-cta:hover {
				background-color: ${navbar?.secondaryCtaHoverColour || 'var(--secondary-cta-hover-colour)'} !important;
				color: ${navbar?.secondaryCtaTextHoverColour || 'var(--secondary-cta-hover-text-colour)'} !important;
				border-color: ${navbar?.secondaryCtaHoverColour || 'var(--secondary-cta-hover-colour)'} !important;
			}
			@media (min-width: 1200px) {
				#navbar-test .nav-link:hover {
					font-family: 'AmpleSoftPro', sans-serif !important;
					font-weight: 700 !important;
				}
			}
		`}</style>
		<style>{`${navbar.customCss}`}</style>
		</>
	);
};

export default NavBar;