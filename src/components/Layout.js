import React from "react";
import CookieBanner from "./Cookie";
import Footer from "./Footer";
import NavBar from "./NavBar";
import Banner from "./Banner";
import WhatsAppIcon from "./WhatsAppIcon";
import DynamicTypography from "../utls/DynamicTypography";
import DynamicCtaStyles from "../utls/DynamicCtaStyles";
import GlobalCustomCss from "../utls/GlobalCustomCss";

const Layout = ({ children, hideNav = false, hideFooter = false }) => {

	return (
		<>
			<DynamicTypography />
			<DynamicCtaStyles />
			<GlobalCustomCss />
			<CookieBanner />

			{/* Banner */}
			<Banner />

			{/* Navigation */}
			<NavBar hideLinks={hideNav} />

			{/* Wrapper to prevent horizontal overflow without breaking sticky positioning */}
			<div style={{ overflowX: 'hidden' }}>
				{/* The rest of your site */}
				{children}
				{!hideFooter && <Footer />}
			</div>

			{/* WhatsApp Icon */}
			<WhatsAppIcon />
		</>
	);
};

export default Layout;
