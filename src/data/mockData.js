// Pre-configured brand profiles and realistic threat datasets for BrandGuard AI

export const BRANDS = [
  {
    id: 'quickpay',
    name: 'QuickPay Technologies',
    industry: 'Fintech & Digital Payments',
    officialHandle: '@QuickPay',
    officialDomain: 'quickpay.com',
    supportHandle: '@QuickPaySupport',
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
    logoUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=150&auto=format&fit=crop&q=80',
    riskThreshold: 60,
    activeThreats: 3
  }
];

export const INITIAL_THREATS = [
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
    status: 'INVESTIGATING', // 'NEW', 'INVESTIGATING', 'TAKEDOWN_SENT', 'RESOLVED'
    logoMatchPercent: 92,
    detectionDate: '2026-10-12T09:14:00Z',
    channel: 'Social Profile'
  },
  {
    id: 'THREAT-102',
    brandId: 'quickpay',
    platform: 'X (Twitter)',
    platformIcon: 'twitter',
    suspectName: 'QuickPay Support Team (Verified Badge Fake)',
    suspectHandle: '@QuickPay_HeIp', // capital I instead of l
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
  {
    id: 'THREAT-103',
    brandId: 'quickpay',
    platform: 'Google Play Store',
    platformIcon: 'smartphone',
    suspectName: 'QuickPay Wallet - Instant Loan & Transfer',
    suspectHandle: 'com.quickpay.wallet.loans.fast',
    avatarUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    suspectBio: 'QuickPay digital loan and money transfer app. Developer: QuickPay Fintech Devs LLC. Permissions: Read Contacts, SMS, Location.',
    suspectUrl: 'https://play.google.com/store/apps/details?id=com.quickpay.wallet.loans.fast',
    postCaptions: [
      'Unusual permissions requested: READ_SMS, ACCESS_FINE_LOCATION, READ_CONTACTS. Unregistered developer.'
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
    id: 'THREAT-105',
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
  {
    id: 'THREAT-106',
    brandId: 'quickpay',
    platform: 'Instagram',
    platformIcon: 'instagram',
    suspectName: 'QuickPay Memes & Community',
    suspectHandle: '@quickpay_memes_fanpage',
    avatarUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=150&auto=format&fit=crop&q=80',
    suspectBio: 'Unofficial fan club posting hilarious fintech memes and startup comedy. Not affiliated with QuickPay official.',
    suspectUrl: '',
    postCaptions: [
      'When your salary hits QuickPay at 11:59 PM',
      'UPI servers on Diwali day be like:'
    ],
    followersCount: 2200,
    accountAgeDays: 140,
    status: 'RESOLVED',
    logoMatchPercent: 35,
    detectionDate: '2026-10-10T11:00:00Z',
    channel: 'Social Profile'
  },
  {
    id: 'THREAT-201',
    brandId: 'novabank',
    platform: 'X (Twitter)',
    platformIcon: 'twitter',
    suspectName: 'NovaBank Fraud Resolution',
    suspectHandle: '@NovaBank_SupportHelp',
    avatarUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=150&auto=format&fit=crop&q=80',
    suspectBio: 'Official Banking Helpline. Block debit card or request chargeback reversal. Helpline 24x7. DM account details.',
    suspectUrl: 'https://novabank-chargeback.click',
    postCaptions: ['Urgent KYC verification required for all credit card accounts.'],
    followersCount: 1980,
    accountAgeDays: 2,
    status: 'NEW',
    logoMatchPercent: 91,
    detectionDate: '2026-10-12T07:30:00Z',
    channel: 'Social Profile'
  },
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
