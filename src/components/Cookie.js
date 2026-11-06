import React, { useEffect, useState } from "react";
import CookieConsent, { Cookies } from "react-cookie-consent";
import { BiCookie } from "react-icons/bi";

const CONSENT_COOKIE = "CookieConsent";

const updateClarityConsent = (value) => {
	window.clarity = window.clarity || function clarity() {
		(window.clarity.q = window.clarity.q || []).push(arguments);
	};
	window.clarity("consentv2", {
		ad_Storage: value,
		analytics_Storage: value,
	});
};

const updateGoogleConsent = (value) => {
	if (typeof window === "undefined") return;

	window.dataLayer = window.dataLayer || [];
	window.gtag = window.gtag || function gtag() {
		window.dataLayer.push(arguments);
	};
	window.gtag("consent", "update", {
		analytics_storage: value,
		ad_storage: value,
		ad_user_data: value,
		ad_personalization: value,
	});
	updateClarityConsent(value);

	if (value === "granted") {
		window.dataLayer.push({ event: "cookie_consent_granted" });
	}
};

const CookieBanner = () => {
	const [hasChoice, setHasChoice] = useState(false);
	const [isManaging, setIsManaging] = useState(false);

	useEffect(() => {
		const savedConsent = Cookies.get(CONSENT_COOKIE);
		setHasChoice(savedConsent === "true" || savedConsent === "false");
	}, []);

	return (
		<>
			{hasChoice && !isManaging && (
				<button
					type="button"
					onClick={() => setIsManaging(true)}
					aria-label="Manage cookies"
					title="Manage cookies"
					className="position-fixed d-flex align-items-center justify-content-center"
					style={{
						zIndex: 999999,
						left: "1rem",
						bottom: "1rem",
						width: "50px",
						height: "50px",
						color: "white",
						border: 0,
						borderRadius: "50%",
						background: "black",
					}}
				>
					<BiCookie aria-hidden="true" style={{ fontSize: "1.5rem" }} />
				</button>
			)}
			<CookieConsent
				flipButtons
				enableDeclineButton
				declineButtonText="Decline"
				location="bottom"
				buttonText="Accept"
				cookieName={CONSENT_COOKIE}
				visible={isManaging ? "show" : "byCookieValue"}
				onAccept={() => {
					updateGoogleConsent("granted");
					setHasChoice(true);
					setIsManaging(false);
				}}
				onDecline={() => {
					updateGoogleConsent("denied");
					setHasChoice(true);
					setIsManaging(false);
				}}
				style={{ background: "black", zIndex: 999999 }}
				declineButtonStyle={{ backgroundColor: "black" }}
				buttonStyle={{
					color: "black",
					fontSize: "1rem",
					backgroundColor: "white",
				}}
				expires={365}
			>
				This website stores data such as cookies to enable site functionality
				including analytics and personalisation. Read our{" "}
				<a
					href="/policies/cookie-policy"
					style={{ color: "white", textDecoration: "underline" }}
				>
					cookie policy
				</a>
				.
			</CookieConsent>
		</>
	);
};

export default CookieBanner;
