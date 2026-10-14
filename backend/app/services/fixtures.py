from typing import List, Dict, Any

# Explicitly labelled synthetic demo candidate records for social & app monitoring
# These records allow reproducible evaluation without claiming live web crawlers.

DEMO_SOCIAL_CANDIDATES: Dict[str, List[Dict[str, Any]]] = {
    "razorpay": [
        # Official account (must be excluded by exclusion layer)
        {
            "candidate_id": "CAND-RZP-SOC-01",
            "platform": "X (Twitter)",
            "channel": "Social Profile",
            "suspect_name": "Razorpay",
            "suspect_handle": "@Razorpay",
            "suspect_bio": "India's leading full-stack financial solutions company. Official verified handle.",
            "post_captions": ["Powering online payments for 10M+ businesses across India."],
            "suspect_url": "https://razorpay.com",
            "followers_count": 210000,
            "account_age_days": 3200,
            "logo_match_percent": 100,
            "provenance": "demo_fixture",
            "is_live": False
        },
        # High-risk impersonator
        {
            "candidate_id": "CAND-RZP-SOC-02",
            "platform": "X (Twitter)",
            "channel": "Social Profile",
            "suspect_name": "Razorpay Helpdesk & Settlement Assist",
            "suspect_handle": "@Razorpay_Support_24x7",
            "suspect_bio": "Official 24/7 emergency merchant settlement desk. Facing delayed payouts? DM for refund support right now.",
            "post_captions": [
                "Replying to @merchant: Send OTP and registered mobile number to push pending UPI payout.",
                "Instant refund service available for active merchants."
            ],
            "suspect_url": "https://razorpay-merchant-refund.xyz/claim",
            "followers_count": 14850,
            "account_age_days": 3,
            "logo_match_percent": 94,
            "provenance": "demo_fixture",
            "is_live": False
        },
        # Instagram fake loan campaign
        {
            "candidate_id": "CAND-RZP-SOC-03",
            "platform": "Instagram",
            "channel": "Social Profile",
            "suspect_name": "Razorpay Capital & Business Credit",
            "suspect_handle": "@Razorpay_Fast_Loans",
            "suspect_bio": "Pre-approved collateral-free business loans up to 10 Lakhs. Zero fees. Urgent KYC verification required.",
            "post_captions": [
                "Exclusive loan disbursal for active MSME merchants. Upload Aadhaar/PAN now.",
                "Claim reward bonus for early signups."
            ],
            "suspect_url": "https://razorpay-capital-apply.top/onboarding",
            "followers_count": 28400,
            "account_age_days": 5,
            "logo_match_percent": 91,
            "provenance": "demo_fixture",
            "is_live": False
        },
        # Low-risk discussion account (similar name, but zero scam signals)
        {
            "candidate_id": "CAND-RZP-SOC-04",
            "platform": "X (Twitter)",
            "channel": "Social Profile",
            "suspect_name": "Razor Tech Reviews",
            "suspect_handle": "@Razor_Pay_TechNews",
            "suspect_bio": "Independent tech enthusiast reviewing payment gateways and developer APIs across Asia.",
            "post_captions": ["Reviewing modern payment architectures in fintech 2026."],
            "suspect_url": "https://techblog.org/fintech-review",
            "followers_count": 1200,
            "account_age_days": 800,
            "logo_match_percent": 20,
            "provenance": "demo_fixture",
            "is_live": False
        }
    ],
    "phonepe": [
        # Official account (must be excluded)
        {
            "candidate_id": "CAND-PHP-SOC-01",
            "platform": "X (Twitter)",
            "channel": "Social Profile",
            "suspect_name": "PhonePe",
            "suspect_handle": "@PhonePe",
            "suspect_bio": "Official Twitter handle of PhonePe India. Never share OTP or UPI PIN with anyone.",
            "post_captions": ["Simple, fast and secure payments for everyone."],
            "suspect_url": "https://phonepe.com",
            "followers_count": 480000,
            "account_age_days": 2900,
            "logo_match_percent": 100,
            "provenance": "demo_fixture",
            "is_live": False
        },
        # Viral Instagram scratch card scam
        {
            "candidate_id": "CAND-PHP-SOC-02",
            "platform": "Instagram",
            "channel": "Social Profile",
            "suspect_name": "PhonePe Official Rewards 2026",
            "suspect_handle": "@PhonePe_Reward_2026",
            "suspect_bio": "Congratulations! You have received ₹2,999 festive cashback reward. Claim reward now before link expires.",
            "post_captions": [
                "Tap link in bio to claim instant refund voucher directly to your bank account."
            ],
            "suspect_url": "https://phonepe-cashback-reward.live/claim",
            "followers_count": 42500,
            "account_age_days": 4,
            "logo_match_percent": 96,
            "provenance": "demo_fixture",
            "is_live": False
        },
        # Deceptive dispute handle
        {
            "candidate_id": "CAND-PHP-SOC-03",
            "platform": "X (Twitter)",
            "channel": "Social Profile",
            "suspect_name": "PhonePe Support & Dispute Desk",
            "suspect_handle": "@PhonePe_HeIp_24x7",
            "suspect_bio": "Customer care helpline 24x7. Reversing failed UPI transactions. DM for refund support.",
            "post_captions": ["Send OTP and ticket number for immediate UPI reversal."],
            "suspect_url": "https://phonepe-dispute-resolve.top/ticket",
            "followers_count": 6120,
            "account_age_days": 1,
            "logo_match_percent": 97,
            "provenance": "demo_fixture",
            "is_live": False
        }
    ],
    "revolut": [
        # Official account (must be excluded)
        {
            "candidate_id": "CAND-REV-SOC-01",
            "platform": "X (Twitter)",
            "channel": "Social Profile",
            "suspect_name": "Revolut",
            "suspect_handle": "@RevolutApp",
            "suspect_bio": "One app, all things money. Official account. We will never ask for your passcode in DMs.",
            "post_captions": ["Spend, save, invest and manage your multi-currency funds globally."],
            "suspect_url": "https://revolut.com",
            "followers_count": 390000,
            "account_age_days": 3100,
            "logo_match_percent": 100,
            "provenance": "demo_fixture",
            "is_live": False
        },
        # Homoglyph unfreeze scam account
        {
            "candidate_id": "CAND-REV-SOC-02",
            "platform": "X (Twitter)",
            "channel": "Social Profile",
            "suspect_name": "Revolut Live Support Desk",
            "suspect_handle": "@Revolut_HeIpDesk",
            "suspect_bio": "Customer care & emergency account resolution bureau. Suspended account? Verify account immediately.",
            "post_captions": ["Urgent KYC verification: Confirm your registered passcode to avoid balance freeze."],
            "suspect_url": "https://revolut-account-recovery.com/auth",
            "followers_count": 19400,
            "account_age_days": 2,
            "logo_match_percent": 98,
            "provenance": "demo_fixture",
            "is_live": False
        }
    ]
}


DEMO_APP_CANDIDATES: Dict[str, List[Dict[str, Any]]] = {
    "razorpay": [
        # Official app (must be excluded)
        {
            "candidate_id": "CAND-RZP-APP-01",
            "platform": "Google Play Store",
            "channel": "Rogue Mobile App",
            "suspect_name": "Razorpay: Payment Gateway & POS",
            "suspect_handle": "Razorpay: Payment Gateway & POS",
            "suspect_publisher": "Razorpay Software Private Limited",
            "suspect_url": "com.razorpay.payments.app",
            "suspect_bio": "Official payment acceptance app for merchants.",
            "post_captions": ["Accept credit cards, debit cards, UPI and netbanking."],
            "followers_count": 500000,
            "account_age_days": 1800,
            "logo_match_percent": 100,
            "provenance": "demo_fixture",
            "is_live": False
        },
        # Rogue Trojan APK
        {
            "candidate_id": "CAND-RZP-APP-02",
            "platform": "Google Play Store",
            "channel": "Rogue Mobile App",
            "suspect_name": "Razorpay POS - Merchant Mobile Terminal",
            "suspect_handle": "Razorpay POS Terminal",
            "suspect_publisher": "Razorpay Cloud Fintech Labs [UNAUTHORIZED]",
            "suspect_url": "com.razorpay.pos.payment.quick",
            "suspect_bio": "Turn your phone into a Razorpay Soundbox and POS terminal. Warning: Requests high-risk permissions READ_SMS.",
            "post_captions": ["High-risk permissions requested: READ_SMS, BIND_ACCESSIBILITY_SERVICE."],
            "followers_count": 65000,
            "account_age_days": 11,
            "logo_match_percent": 89,
            "provenance": "demo_fixture",
            "is_live": False
        },
        # Fake Rewards APK
        {
            "candidate_id": "CAND-RZP-APP-03",
            "platform": "Google Play Store",
            "channel": "Rogue Mobile App",
            "suspect_name": "Razorpay Scratch Cards & Instant Cash",
            "suspect_handle": "Razorpay Scratch & Win",
            "suspect_publisher": "Global Media Apps Inc. [UNAUTHORIZED]",
            "suspect_url": "com.reward.razorpay.cashback",
            "suspect_bio": "Scratch and win real money into your bank account via Razorpay UPI. Unofficial APK.",
            "post_captions": ["Requests WRITE_EXTERNAL_STORAGE, READ_PHONE_STATE, READ_SMS."],
            "followers_count": 22000,
            "account_age_days": 8,
            "logo_match_percent": 83,
            "provenance": "demo_fixture",
            "is_live": False
        }
    ],
    "phonepe": [
        # Official app
        {
            "candidate_id": "CAND-PHP-APP-01",
            "platform": "Google Play Store",
            "channel": "Rogue Mobile App",
            "suspect_name": "PhonePe: UPI, Recharges & Payments",
            "suspect_handle": "PhonePe: UPI, Recharges & Payments",
            "suspect_publisher": "PhonePe India Private Limited",
            "suspect_url": "com.phonepe.app",
            "suspect_bio": "Official PhonePe UPI payments app.",
            "post_captions": ["Send money, pay bills, recharge and invest securely."],
            "followers_count": 100000000,
            "account_age_days": 2500,
            "logo_match_percent": 100,
            "provenance": "demo_fixture",
            "is_live": False
        },
        # Malicious gold reward app
        {
            "candidate_id": "CAND-PHP-APP-02",
            "platform": "Google Play Store",
            "channel": "Rogue Mobile App",
            "suspect_name": "PhonePe Gold & Daily Cashback Rewards",
            "suspect_handle": "PhonePe Gold Rewards",
            "suspect_publisher": "Digital Gold Media Labs [UNAUTHORIZED]",
            "suspect_url": "com.phonepe.rewards.gold.bonus",
            "suspect_bio": "Claim free 24K digital gold and ₹500 welcome bonus on PhonePe. Requests READ_SMS and RECEIVE_SMS.",
            "post_captions": ["Trojanized banking dropper intercepts incoming SMS OTPs."],
            "followers_count": 84000,
            "account_age_days": 14,
            "logo_match_percent": 92,
            "provenance": "demo_fixture",
            "is_live": False
        }
    ],
    "revolut": [
        # Official app
        {
            "candidate_id": "CAND-REV-APP-01",
            "platform": "Google Play Store",
            "channel": "Rogue Mobile App",
            "suspect_name": "Revolut: Spend, Save, Invest",
            "suspect_handle": "Revolut: Spend, Save, Invest",
            "suspect_publisher": "Revolut Ltd",
            "suspect_url": "com.revolut.revolut",
            "suspect_bio": "Official mobile banking application of Revolut Ltd.",
            "post_captions": ["Manage all your money in one smart app."],
            "followers_count": 25000000,
            "account_age_days": 2800,
            "logo_match_percent": 100,
            "provenance": "demo_fixture",
            "is_live": False
        },
        # Trojan Authenticator APK
        {
            "candidate_id": "CAND-REV-APP-02",
            "platform": "Google Play Store",
            "channel": "Rogue Mobile App",
            "suspect_name": "Revolut Security Authenticator & Key",
            "suspect_handle": "Revolut Security Key",
            "suspect_publisher": "Revolut Security Labs Ltd [UNAUTHORIZED]",
            "suspect_url": "com.revolut.security.authenticator.pro",
            "suspect_bio": "Security patch for Revolut users. Requests Accessibility and SMS permissions.",
            "post_captions": ["Dangerous permissions: BIND_ACCESSIBILITY_SERVICE, READ_SMS."],
            "followers_count": 41000,
            "account_age_days": 7,
            "logo_match_percent": 91,
            "provenance": "demo_fixture",
            "is_live": False
        }
    ]
}
