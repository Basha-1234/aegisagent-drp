// Pre-configured enterprise brand profiles and realistic threat datasets for AegisAgent DRP
// Aligned with Kampus.VC Digital Risk Protection Evaluation Criteria & Real-World Recorded Scams

export const BRANDS = [
  {
    id: 'razorpay',
    name: 'Razorpay Technologies',
    industry: 'Payment Gateway & Merchant B2B Fintech',
    officialHandle: '@Razorpay',
    officialDomain: 'razorpay.com',
    supportHandle: '@RazorpaySupport',
    verifiedHandles: ['@Razorpay', '@RazorpaySupport', '@RazorpayCare'],
    officialApps: [
      {
        appName: 'Razorpay: Payment Gateway & POS',
        appId: 'com.razorpay.payments.app',
        publisher: 'Razorpay Software Private Limited',
        store: 'Google Play & Apple App Store',
        rating: 4.7,
        iconUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80'
      }
    ],
    logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    riskThreshold: 50,
    activeThreats: 6
  },
  {
    id: 'phonepe',
    name: 'PhonePe UPI & Payments',
    industry: 'Consumer UPI Payments & Financial Services',
    officialHandle: '@PhonePe',
    officialDomain: 'phonepe.com',
    supportHandle: '@PhonePeSupport',
    verifiedHandles: ['@PhonePe', '@PhonePeSupport', '@PhonePe_Help'],
    officialApps: [
      {
        appName: 'PhonePe: UPI, Recharges & Payments',
        appId: 'com.phonepe.app',
        publisher: 'PhonePe India Private Limited',
        store: 'Google Play & Apple App Store',
        rating: 4.8,
        iconUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=150&auto=format&fit=crop&q=80'
      }
    ],
    logoUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=150&auto=format&fit=crop&q=80',
    riskThreshold: 45,
    activeThreats: 6
  },
  {
    id: 'revolut',
    name: 'Revolut NeoBank',
    industry: 'Global Digital NeoBanking & Crypto',
    officialHandle: '@RevolutApp',
    officialDomain: 'revolut.com',
    supportHandle: '@RevolutSupport',
    verifiedHandles: ['@RevolutApp', '@RevolutSupport', '@RevolutInsider'],
    officialApps: [
      {
        appName: 'Revolut: Spend, Save, Invest',
        appId: 'com.revolut.revolut',
        publisher: 'Revolut Ltd',
        store: 'Google Play & Apple App Store',
        rating: 4.8,
        iconUrl: 'https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=150&auto=format&fit=crop&q=80'
      }
    ],
    logoUrl: 'https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=150&auto=format&fit=crop&q=80',
    riskThreshold: 60,
    activeThreats: 6
  }
];

export const INITIAL_THREATS = [
  // =========================================================================
  // TENANT 1: RAZORPAY TECHNOLOGIES (6 Real-World Recorded Threat Vectors)
  // =========================================================================
  {
    id: 'THREAT-RZP-101',
    brandId: 'razorpay',
    platform: 'X (Twitter)',
    platformIcon: 'twitter',
    suspectName: 'Razorpay Helpdesk & Settlement Assist',
    suspectHandle: '@Razorpay_Support_24x7',
    avatarUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    suspectBio: 'Official 24/7 emergency merchant settlement desk. Facing delayed payouts or payment gateway failure? DM your Merchant ID and transaction reference immediately.',
    suspectUrl: 'https://razorpay-merchant-refund.xyz/claim',
    postCaptions: [
      'Replying to @merchant_dev: Kindly DM your registered email and 6-digit OTP so our engineering desk can push the stuck UPI payout.',
      'Scheduled maintenance notice: Click here to verify merchant settlement account.'
    ],
    followersCount: 14850,
    accountAgeDays: 3,
    status: 'INVESTIGATING',
    logoMatchPercent: 94,
    detectionDate: '2026-10-14T09:14:00Z',
    channel: 'Social Profile'
  },
  {
    id: 'THREAT-RZP-102',
    brandId: 'razorpay',
    platform: 'Instagram',
    platformIcon: 'instagram',
    suspectName: 'Razorpay Capital & Business Credit',
    suspectHandle: '@Razorpay_Fast_Loans',
    avatarUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    suspectBio: 'Get collateral-free business loans up to ₹10 Lakhs approved in 2 mins for Razorpay merchants. Zero processing fee. Apply via bio link.',
    suspectUrl: 'https://razorpay-capital-apply.top/onboarding',
    postCaptions: [
      'Exclusive loan disbursal for active MSME merchants. Upload Aadhaar/PAN now.',
      'Pre-approved ₹5,00,000 credit line waiting for your business!'
    ],
    followersCount: 28400,
    accountAgeDays: 5,
    status: 'NEW',
    logoMatchPercent: 91,
    detectionDate: '2026-10-14T10:45:00Z',
    channel: 'Social Profile'
  },
  {
    id: 'THREAT-RZP-103',
    brandId: 'razorpay',
    platform: 'Google Play Store',
    platformIcon: 'smartphone',
    suspectName: 'Razorpay POS - Merchant Mobile Terminal',
    suspectHandle: 'Razorpay POS Terminal',
    suspectPublisher: 'Razorpay Cloud Fintech Labs [UNAUTHORIZED]',
    suspectUrl: 'com.razorpay.pos.payment.quick',
    avatarUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    suspectBio: 'Turn your phone into a Razorpay Soundbox and POS terminal. Warning: Requests high-risk permissions READ_SMS, BIND_ACCESSIBILITY_SERVICE, and installs remote overlay.',
    postCaptions: [
      'High-risk permissions requested: READ_SMS, BIND_ACCESSIBILITY_SERVICE, RECEIVE_BOOT_COMPLETED. Bypasses 2FA via overlay injections.'
    ],
    followersCount: 65000,
    accountAgeDays: 11,
    status: 'NEW',
    logoMatchPercent: 89,
    detectionDate: '2026-10-13T16:20:00Z',
    channel: 'Rogue Mobile App'
  },
  {
    id: 'THREAT-RZP-104',
    brandId: 'razorpay',
    platform: 'Phishing Domain',
    platformIcon: 'globe',
    suspectName: 'Razorpay Merchant Dashboard Clone',
    suspectHandle: 'razørpay-verification.net',
    avatarUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    suspectBio: 'Cloned Razorpay enterprise login page with valid Let\'s Encrypt SSL certificate. Harvests merchant email, API keys, and 2FA auth codes.',
    suspectUrl: 'https://razørpay-verification.net/dashboard/login',
    postCaptions: [
      'Phishing lure circulated on WhatsApp and email: "Your Razorpay API settlement is withheld pending mandatory compliance re-verification."'
    ],
    followersCount: 0,
    accountAgeDays: 2,
    status: 'TAKEDOWN_SENT',
    logoMatchPercent: 98,
    detectionDate: '2026-10-13T20:10:00Z',
    channel: 'Phishing Website'
  },
  {
    id: 'THREAT-RZP-105',
    brandId: 'razorpay',
    platform: 'Telegram',
    platformIcon: 'send',
    suspectName: 'Razorpay VIP Payment Gateway & OTP Bypass',
    suspectHandle: '@Razorpay_Gateway_VIP',
    avatarUrl: 'https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=150&auto=format&fit=crop&q=80',
    suspectBio: 'Ready-made Razorpay test credentials, high-limit merchant accounts for sale, instant recharge refunds.',
    suspectUrl: 'https://t.me/Razorpay_Gateway_VIP',
    postCaptions: [
      'Over 400 credentials dumped today. Contact @admin for instant merchant access.'
    ],
    followersCount: 9200,
    accountAgeDays: 7,
    status: 'NEW',
    logoMatchPercent: 76,
    detectionDate: '2026-10-14T08:02:00Z',
    channel: 'Messaging Channel'
  },
  {
    id: 'THREAT-RZP-106',
    brandId: 'razorpay',
    platform: 'Google Play Store',
    platformIcon: 'smartphone',
    suspectName: 'Razorpay Scratch Cards & Instant Cash',
    suspectHandle: 'Razorpay Scratch & Win',
    suspectPublisher: 'Global Media Apps Inc. [UNAUTHORIZED]',
    suspectUrl: 'com.reward.razorpay.cashback',
    avatarUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    suspectBio: 'Scratch and win real money into your bank account via Razorpay UPI. Unofficial APK seeking sensitive permissions.',
    postCaptions: ['Requests WRITE_EXTERNAL_STORAGE, READ_PHONE_STATE, READ_SMS.'],
    followersCount: 22000,
    accountAgeDays: 8,
    status: 'INVESTIGATING',
    logoMatchPercent: 83,
    detectionDate: '2026-10-14T05:30:00Z',
    channel: 'Rogue Mobile App'
  },

  // =========================================================================
  // TENANT 2: PHONEPE UPI & PAYMENTS (6 Real-World Recorded Threat Vectors)
  // =========================================================================
  {
    id: 'THREAT-PHP-201',
    brandId: 'phonepe',
    platform: 'Instagram',
    platformIcon: 'instagram',
    suspectName: 'PhonePe Official Rewards 2026',
    suspectHandle: '@PhonePe_Reward_2026',
    avatarUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=150&auto=format&fit=crop&q=80',
    suspectBio: 'Congratulations! You have received ₹2,999 festive cashback reward on PhonePe. Click link in bio to credit money to your bank immediately.',
    suspectUrl: 'https://phonepe-cashback-reward.live/claim',
    postCaptions: [
      'Viral lure: Shows animated golden scratch card. Tricking victims to tap "Send" via UPI intent link that actually debits ₹2,999 instead of crediting!',
      'Over 10,000 customers already claimed. Valid for next 2 hours only.'
    ],
    followersCount: 42500,
    accountAgeDays: 4,
    status: 'INVESTIGATING',
    logoMatchPercent: 96,
    detectionDate: '2026-10-14T09:30:00Z',
    channel: 'Social Profile'
  },
  {
    id: 'THREAT-PHP-202',
    brandId: 'phonepe',
    platform: 'X (Twitter)',
    platformIcon: 'twitter',
    suspectName: 'PhonePe Support & Dispute Desk',
    suspectHandle: '@PhonePe_HeIp_24x7',
    avatarUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=150&auto=format&fit=crop&q=80',
    suspectBio: 'Official PhonePe India Grievance & Instant Reversal Support. Reversing failed UPI transactions within 15 minutes.',
    suspectUrl: 'https://phonepe-dispute-resolve.top/ticket',
    postCaptions: [
      'Replying to @user_failed_upi: We regret the delay. Please share your UPI Reference ID and mobile number in DM to initiate bank reversal.',
      'Do not share your MPIN with anyone except through our secured ticket link.'
    ],
    followersCount: 6120,
    accountAgeDays: 1,
    status: 'NEW',
    logoMatchPercent: 97,
    detectionDate: '2026-10-14T11:15:00Z',
    channel: 'Social Profile'
  },
  {
    id: 'THREAT-PHP-203',
    brandId: 'phonepe',
    platform: 'Google Play Store',
    platformIcon: 'smartphone',
    suspectName: 'PhonePe Gold & Daily Cashback Rewards',
    suspectHandle: 'PhonePe Gold Rewards',
    suspectPublisher: 'Digital Gold Media Labs [UNAUTHORIZED]',
    suspectUrl: 'com.phonepe.rewards.gold.bonus',
    avatarUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=150&auto=format&fit=crop&q=80',
    suspectBio: 'Claim free 24K digital gold and ₹500 welcome bonus on PhonePe. Requests dangerous permissions: READ_SMS, RECEIVE_SMS, READ_CONTACTS.',
    postCaptions: [
      'Trojanized banking dropper intercepts incoming SMS OTPs and transmits to C2 server: http://194.26.29.112:8080/exfil.'
    ],
    followersCount: 84000,
    accountAgeDays: 14,
    status: 'NEW',
    logoMatchPercent: 92,
    detectionDate: '2026-10-13T14:40:00Z',
    channel: 'Rogue Mobile App'
  },
  {
    id: 'THREAT-PHP-204',
    brandId: 'phonepe',
    platform: 'Phishing Domain',
    platformIcon: 'globe',
    suspectName: 'PhonePe KYC Dispute Portal',
    suspectHandle: 'phønepe-kyc-update.xyz',
    avatarUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=150&auto=format&fit=crop&q=80',
    suspectBio: 'Phishing clone imitating official PhonePe web interface. Prompts victim to enter linked bank account number, debit card expiry, and 6-digit UPI MPIN.',
    suspectUrl: 'https://phønepe-kyc-update.xyz/verify',
    postCaptions: [
      'Circulated via automated bulk SMS: "Dear Customer, your PhonePe wallet will be deactivated today. Click here to submit pan card."'
    ],
    followersCount: 0,
    accountAgeDays: 3,
    status: 'TAKEDOWN_SENT',
    logoMatchPercent: 99,
    detectionDate: '2026-10-13T18:22:00Z',
    channel: 'Phishing Website'
  },
  {
    id: 'THREAT-PHP-205',
    brandId: 'phonepe',
    platform: 'Telegram',
    platformIcon: 'send',
    suspectName: 'PhonePe UPI Script & Refund Leak',
    suspectHandle: '@PhonePe_UPI_Mod',
    avatarUrl: 'https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=150&auto=format&fit=crop&q=80',
    suspectBio: 'Download PhonePe modded APK with zero transaction charges and auto-scratch reward script.',
    suspectUrl: 'https://t.me/PhonePe_UPI_Mod',
    postCaptions: [
      'New script released: Unlimited scratch card exploit v4.2. Run at own risk.'
    ],
    followersCount: 18300,
    accountAgeDays: 9,
    status: 'NEW',
    logoMatchPercent: 78,
    detectionDate: '2026-10-14T06:18:00Z',
    channel: 'Messaging Channel'
  },
  {
    id: 'THREAT-PHP-206',
    brandId: 'phonepe',
    platform: 'Google Play Store',
    platformIcon: 'smartphone',
    suspectName: 'PhonePe Loan Fast - Instant Approval',
    suspectHandle: 'PhonePe Instant Loan',
    suspectPublisher: 'Speedy Credit Fintech [UNAUTHORIZED]',
    suspectUrl: 'com.instantloan.phonepe.cash',
    avatarUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=150&auto=format&fit=crop&q=80',
    suspectBio: 'Borrow up to ₹50,000 instantly to your PhonePe account with zero credit history. Asks for camera, storage, and contacts access to blackmail users.',
    postCaptions: ['Requests ACCESS_FINE_LOCATION, READ_CONTACTS, CAMERA, READ_MEDIA_IMAGES.'],
    followersCount: 35000,
    accountAgeDays: 6,
    status: 'INVESTIGATING',
    logoMatchPercent: 85,
    detectionDate: '2026-10-14T07:45:00Z',
    channel: 'Rogue Mobile App'
  },

  // =========================================================================
  // TENANT 3: REVOLUT NEOBANK (6 Real-World Recorded Threat Vectors)
  // =========================================================================
  {
    id: 'THREAT-REV-301',
    brandId: 'revolut',
    platform: 'X (Twitter)',
    platformIcon: 'twitter',
    suspectName: 'Revolut Live Support Desk',
    suspectHandle: '@Revolut_HeIpDesk',
    avatarUrl: 'https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=150&auto=format&fit=crop&q=80',
    suspectBio: 'Revolut Customer Escalations & Account Unlock Bureau. Is your account under AML review or suspended? DM ticket number for immediate bypass.',
    suspectUrl: 'https://revolut-account-recovery.com/auth',
    postCaptions: [
      'Replying to @crypto_trader: Hello, we have flagged your pending EUR transfer. Please visit our secure resolution portal to confirm identity.',
      'Avoid account termination by re-verifying your registered passcode within 1 hour.'
    ],
    followersCount: 19400,
    accountAgeDays: 2,
    status: 'INVESTIGATING',
    logoMatchPercent: 98,
    detectionDate: '2026-10-14T10:10:00Z',
    channel: 'Social Profile'
  },
  {
    id: 'THREAT-REV-302',
    brandId: 'revolut',
    platform: 'Instagram',
    platformIcon: 'instagram',
    suspectName: 'Revolut Crypto Wealth AI',
    suspectHandle: '@Revolut_Crypto_Wealth',
    avatarUrl: 'https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=150&auto=format&fit=crop&q=80',
    suspectBio: 'Official Revolut Web3 & Crypto Arbitrage pool. Stake ETH/BTC to receive guaranteed 18.5% weekly APY directly into your Revolut Multi-Currency account.',
    suspectUrl: 'https://revolut-staking-yield.io/connect',
    postCaptions: [
      'Exclusive for Revolut Metal & Ultra tier members: Connect WalletConnect or Ledger to activate automated AI yield farming.',
      'Limited pool allocation remaining. Tap link in bio.'
    ],
    followersCount: 53000,
    accountAgeDays: 8,
    status: 'NEW',
    logoMatchPercent: 93,
    detectionDate: '2026-10-14T08:50:00Z',
    channel: 'Social Profile'
  },
  {
    id: 'THREAT-REV-303',
    brandId: 'revolut',
    platform: 'Google Play Store',
    platformIcon: 'smartphone',
    suspectName: 'Revolut Security Authenticator & Key',
    suspectHandle: 'Revolut Security Key',
    suspectPublisher: 'Revolut Security Labs Ltd [UNAUTHORIZED]',
    suspectUrl: 'com.revolut.security.authenticator.pro',
    avatarUrl: 'https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=150&auto=format&fit=crop&q=80',
    suspectBio: 'Mandatory security patch for Revolut multi-currency users. Prevents unauthorized international wire fraud. Requests Accessibility services and SMS permissions.',
    postCaptions: [
      'Dangerous permissions: BIND_ACCESSIBILITY_SERVICE, READ_SMS, SYSTEM_ALERT_WINDOW. Steals Revolut 6-digit passcode and live push confirmation tokens.'
    ],
    followersCount: 41000,
    accountAgeDays: 7,
    status: 'NEW',
    logoMatchPercent: 91,
    detectionDate: '2026-10-13T17:15:00Z',
    channel: 'Rogue Mobile App'
  },
  {
    id: 'THREAT-REV-304',
    brandId: 'revolut',
    platform: 'Phishing Domain',
    platformIcon: 'globe',
    suspectName: 'Revolut Web App Phishing Clone',
    suspectHandle: 'revoIut-auth.com',
    avatarUrl: 'https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=150&auto=format&fit=crop&q=80',
    suspectBio: 'Pixel-perfect replica of the Revolut Web portal. Prompts user for phone number, 6-digit PIN, and camera selfie verification to compromise high-net-worth accounts.',
    suspectUrl: 'https://revoIut-auth.com/app/signin',
    postCaptions: [
      'Targeted spear-phishing lure sent to Revolut Business customers: "Unusual login from Frankfurt, Germany. Review session now."'
    ],
    followersCount: 0,
    accountAgeDays: 1,
    status: 'TAKEDOWN_SENT',
    logoMatchPercent: 99,
    detectionDate: '2026-10-14T01:30:00Z',
    channel: 'Phishing Website'
  },
  {
    id: 'THREAT-REV-305',
    brandId: 'revolut',
    platform: 'Telegram',
    platformIcon: 'send',
    suspectName: 'Revolut KYC Bypasser & Logs',
    suspectHandle: '@Revolut_KYC_BlackMarket',
    avatarUrl: 'https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=150&auto=format&fit=crop&q=80',
    suspectBio: 'Verified Revolut personal & business accounts with documents, stealth debit cards, and automated OTP intercept bots.',
    suspectUrl: 'https://t.me/Revolut_KYC_BlackMarket',
    postCaptions: [
      'Selling fresh EU / UK Revolut drops. Zero AML flags. Escrow accepted.'
    ],
    followersCount: 15700,
    accountAgeDays: 12,
    status: 'NEW',
    logoMatchPercent: 75,
    detectionDate: '2026-10-14T04:20:00Z',
    channel: 'Messaging Channel'
  },
  {
    id: 'THREAT-REV-306',
    brandId: 'revolut',
    platform: 'Google Play Store',
    platformIcon: 'smartphone',
    suspectName: 'Revolut Trader - Zero Commission Forex',
    suspectHandle: 'Revolut Trader Pro',
    suspectPublisher: 'Apex FX Global Softwares [UNAUTHORIZED]',
    suspectUrl: 'com.apexfx.revolut.trade',
    avatarUrl: 'https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=150&auto=format&fit=crop&q=80',
    suspectBio: 'Trade stocks, gold, and currencies with zero fees using your Revolut balance. Unregistered financial broker app.',
    postCaptions: ['Captures user bank login details without SSL encryption.'],
    followersCount: 18500,
    accountAgeDays: 10,
    status: 'INVESTIGATING',
    logoMatchPercent: 84,
    detectionDate: '2026-10-14T07:10:00Z',
    channel: 'Rogue Mobile App'
  }
];
