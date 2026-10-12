// Pre-configured brand profiles and realistic threat datasets for BrandGuard AI
// Fully aligned with Kampus.VC Digital Risk Protection Evaluation Criteria

export const BRANDS = [
  {
    id: 'quickpay',
    name: 'QuickPay Technologies',
    industry: 'Fintech & Digital Payments',
    officialHandle: '@QuickPay',
    officialDomain: 'quickpay.com',
    supportHandle: '@QuickPaySupport',
    verifiedHandles: ['@QuickPay', '@QuickPaySupport', '@QuickPayHelpdesk'],
    officialApps: [
      {
        appName: 'QuickPay: UPI & Money Transfer',
        appId: 'com.quickpay.wallet',
        publisher: 'QuickPay Technologies Inc.',
        store: 'Google Play & iOS App Store',
        rating: 4.8,
        iconUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80'
      }
    ],
    logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    riskThreshold: 50,
    activeThreats: 6
  },
  {
    id: 'novabank',
    name: 'NovaBank International',
    industry: 'Banking & Financial Services',
    officialHandle: '@NovaBank',
    officialDomain: 'novabank.global',
    supportHandle: '@NovaBankHelp',
    verifiedHandles: ['@NovaBank', '@NovaBankHelp'],
    officialApps: [
      {
        appName: 'NovaBank Mobile Banking',
        appId: 'com.novabank.mobile',
        publisher: 'NovaBank Financial Group',
        store: 'Google Play Store',
        rating: 4.7,
        iconUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=150&auto=format&fit=crop&q=80'
      }
    ],
    logoUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=150&auto=format&fit=crop&q=80',
    riskThreshold: 45,
    activeThreats: 4
  },
  {
    id: 'aurawear',
    name: 'Aura Lifestyle & Wear',
    industry: 'E-Commerce & Fashion',
    officialHandle: '@AuraWear',
    officialDomain: 'aurawear.store',
    supportHandle: '@AuraCare',
    verifiedHandles: ['@AuraWear', '@AuraCare'],
    officialApps: [
      {
        appName: 'Aura Wear: Online Shopping',
        appId: 'com.aurawear.shopping',
        publisher: 'Aura Retail Global Ltd',
        store: 'iOS App Store & Google Play',
        rating: 4.6,
        iconUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=150&auto=format&fit=crop&q=80'
      }
    ],
    logoUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=150&auto=format&fit=crop&q=80',
    riskThreshold: 60,
    activeThreats: 3
  }
];

export const INITIAL_THREATS = [
  // 1. Social Media Monitoring (30% Rubric)
  {
    id: 'THREAT-101',
    brandId: 'quickpay',
    platform: 'Instagram',
    platformIcon: 'instagram',
    suspectName: 'QuickPay Official Helpdesk',
    suspectHandle: '@QuickPay_Support_24x7',
    avatarUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    suspectBio: 'Official 24/7 customer care & instant refund resolution helpline. Facing transaction failure? DM for refund support right now.',
    suspectUrl: 'https://quickpay-refund-helpdesk.xyz/claim',
    postCaptions: [
      'Failed payment? Send transaction ID to our DM. Instant refund processed within 5 mins.',
      'Claim reward voucher ₹5000 for QuickPay active wallet users. Click link in bio.'
    ],
    followersCount: 14200,
    accountAgeDays: 4,
    status: 'INVESTIGATING',
    logoMatchPercent: 92,
    detectionDate: '2026-10-12T09:14:00Z',
    channel: 'Social Profile'
  },
  {
    id: 'THREAT-102',
    brandId: 'quickpay',
    platform: 'X (Twitter)',
    platformIcon: 'twitter',
    suspectName: 'QuickPay Support Team (Character Swap Squatting)',
    suspectHandle: '@QuickPay_HeIp', // capital I for l
    avatarUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    suspectBio: 'QuickPay Emergency Resolution Center. Send OTP / Ticket number for immediate reversal of stuck UPI payments.',
    suspectUrl: 'https://quickpay-support-desk.top/verify',
    postCaptions: [
      'Replying to @customer: Kindly share your registered phone number and send OTP in DM to unfreeze your balance.'
    ],
    followersCount: 3890,
    accountAgeDays: 1,
    status: 'NEW',
    logoMatchPercent: 96,
    detectionDate: '2026-10-12T10:45:00Z',
    channel: 'Social Profile'
  },

  // 2. App Store Monitoring (30% Rubric - Dedicated Rogue Mobile Apps)
  {
    id: 'THREAT-103',
    brandId: 'quickpay',
    platform: 'Google Play Store',
    platformIcon: 'smartphone',
    suspectName: 'QuickPay Wallet - Instant Loan & Transfer',
    suspectHandle: 'QuickPay Loan Wallet',
    suspectPublisher: 'QuickPay Fintech Devs LLC [UNAUTHORIZED]',
    suspectUrl: 'com.quickpay.wallet.loans.fast',
    avatarUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    suspectBio: 'QuickPay digital loan and instant money transfer app. Developer: QuickPay Fintech Devs LLC. Unusual high-risk permissions: Read Contacts, SMS, Location.',
    postCaptions: [
      'High-risk permissions requested: READ_SMS, ACCESS_FINE_LOCATION, READ_CONTACTS. Unregistered developer.'
    ],
    followersCount: 50000,
    accountAgeDays: 12,
    status: 'NEW',
    logoMatchPercent: 88,
    detectionDate: '2026-10-11T16:20:00Z',
    channel: 'Rogue Mobile App'
  },
  {
    id: 'THREAT-104',
    brandId: 'quickpay',
    platform: 'Google Play Store',
    platformIcon: 'smartphone',
    suspectName: 'QuickPay Rewards & UPI Scratch Cards',
    suspectHandle: 'QuickPay Scratch & Win',
    suspectPublisher: 'Global Rewards Media Ltd [UNAUTHORIZED]',
    suspectUrl: 'com.rewards.quickpay.scratch',
    avatarUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    suspectBio: 'Claim daily cash rewards on your QuickPay account. Enter bank account details to receive bonus cashback. Developer not affiliated with official entity.',
    postCaptions: ['Asks user to link bank account without OAuth token.'],
    followersCount: 15000,
    accountAgeDays: 6,
    status: 'INVESTIGATING',
    logoMatchPercent: 82,
    detectionDate: '2026-10-12T05:30:00Z',
    channel: 'Rogue Mobile App'
  },

  // 3. Messaging Channel & Phishing Domains
  {
    id: 'THREAT-105',
    brandId: 'quickpay',
    platform: 'Telegram',
    platformIcon: 'send',
    suspectName: 'QuickPay Crypto Bonus Channel',
    suspectHandle: '@QuickPay_Crypto_Giveaway',
    avatarUrl: 'https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=150&auto=format&fit=crop&q=80',
    suspectBio: 'Exclusive partnership bonus. Deposit ₹1,000 get ₹5,000 QuickPay crypto tokens instantly. Giveaway claim active for 24h only.',
    suspectUrl: 'https://quickpay-bonus-claim.xyz',
    postCaptions: [
      'Over 2,000 members received payout today! Connect wallet now.'
    ],
    followersCount: 8940,
    accountAgeDays: 3,
    status: 'NEW',
    logoMatchPercent: 74,
    detectionDate: '2026-10-12T08:02:00Z',
    channel: 'Messaging Channel'
  },
  {
    id: 'THREAT-106',
    brandId: 'quickpay',
    platform: 'Phishing Domain',
    platformIcon: 'globe',
    suspectName: 'QuickPay KYC Update Portal',
    suspectHandle: 'quickpay-kyc-verification.top',
    avatarUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    suspectBio: 'Deceptive lookalike landing page cloning QuickPay login portal. Captures netbanking credentials and MPIN.',
    suspectUrl: 'https://quickpay-kyc-verification.top/auth',
    postCaptions: [
      'SMS lure observed: "Dear QuickPay customer, your account will be suspended today. Update KYC urgently here: bit.ly/qp-kyc"'
    ],
    followersCount: 0,
    accountAgeDays: 2,
    status: 'TAKEDOWN_SENT',
    logoMatchPercent: 98,
    detectionDate: '2026-10-11T20:10:00Z',
    channel: 'Phishing Website'
  },

  // NovaBank threat
  {
    id: 'THREAT-201',
    brandId: 'novabank',
    platform: 'Google Play Store',
    platformIcon: 'smartphone',
    suspectName: 'NovaBank Online NetBanking Pro',
    suspectHandle: 'NovaBank Pro',
    suspectPublisher: 'Apex Digital Softwares [UNAUTHORIZED]',
    suspectUrl: 'com.apex.novabank.netbanking',
    avatarUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=150&auto=format&fit=crop&q=80',
    suspectBio: 'Access NovaBank accounts, transfer funds, check statements. Warning: Captures customer login credentials without TLS verification.',
    postCaptions: ['Malicious banking Trojan signature detected.'],
    followersCount: 12000,
    accountAgeDays: 5,
    status: 'NEW',
    logoMatchPercent: 94,
    detectionDate: '2026-10-12T07:30:00Z',
    channel: 'Rogue Mobile App'
  },

  // AuraWear threat
  {
    id: 'THREAT-301',
    brandId: 'aurawear',
    platform: 'Instagram',
    platformIcon: 'instagram',
    suspectName: 'Aura Wear 80% Clearance Sale',
    suspectHandle: '@AuraWear_Outlet_Official',
    avatarUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=150&auto=format&fit=crop&q=80',
    suspectBio: 'Warehouse clearance sale! Grab premium jackets & sneakers at ₹499 only. Cash on delivery not available. Click to order.',
    suspectUrl: 'https://aurawear-sale.buzz',
    postCaptions: ['Order now before stock runs out! Limited stock.'],
    followersCount: 31200,
    accountAgeDays: 5,
    status: 'INVESTIGATING',
    logoMatchPercent: 89,
    detectionDate: '2026-10-12T06:15:00Z',
    channel: 'Social Profile'
  }
];
