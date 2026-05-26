export const SUBSCRIPTION_STRINGS = {
  TITLE: 'Subscription',
  SUBTITLE: 'Manage your plan, add-ons and billing history',
  TABS: {
    PLANS: 'Plans',
    MY_SUBSCRIPTION: 'My Subscription',
    ADD_ONS: 'Add-ons',
    TRANSACTIONS: 'Transactions',
  },
  PLANS: {
    STARTER: 'Starter',
    PRO: 'Pro',
    FREE: 'Free',
    PER_MONTH: '/ month',
    CURRENT_PLAN: 'Current plan',
    SUBSCRIBE: 'Subscribe',
    MOST_POPULAR: 'Most popular',
    COMMITMENT: '12-month commitment',
    AUTO_DEBIT_HELP: 'Payments are auto-debited on the same date each month for 12 months.',
  },
  MY_SUB: {
    ACTIVE: 'Active',
    CANCELLED: 'Cancelled',
    PERIOD_START: 'Period start',
    NEXT_DEBIT: 'Next debit',
    MONTHS_LEFT: 'Months left',
    MONTHS_PAID: 'Months paid',
    TESTS_USED: 'Tests used this period',
    QUESTIONS_USED: 'Custom questions',
    CANCEL_LINK: 'Cancel subscription',
    NO_ACTIVE: 'No active subscription',
  },
  ADD_ONS: {
    TITLE: 'Buy extra resources',
    SUBTITLE: 'Add-ons are one-time purchases. They expire when your current subscription period ends.',
    EXTRA_TESTS: 'Extra tests',
    EXTRA_QUESTIONS: 'Extra questions',
    PER_UNIT: '/ unit',
    PAY: 'Pay',
  },
  TRANSACTIONS: {
    TITLE: 'All transactions',
    TABLE_HEADERS: {
      SERIAL: '#',
      DATE: 'Date',
      DESCRIPTION: 'Description',
      AMOUNT: 'Amount',
      STATUS: 'Status',
    },
    DETAILS: 'Details',
    EXPANDED: {
      SUB_ID: 'Subscription ID',
      PAY_ID: 'Payment ID',
      METHOD: 'Method',
      PERIOD: 'Period',
      INVOICE: 'Invoice',
      DOWNLOAD: 'Download PDF',
    }
  }
};

export const COLORS = {
  PRIMARY: '#24C5DA',
  TEAL_LT: '#E1F5EE',
  AMBER: '#BA7517',
  AMBER_LT: '#FAEEDA',
  AMBER_MD: '#EF9F27',
  RED: '#A32D2D',
  RED_LT: '#FCEBEB',
  RED_MD: '#E24B4A',
  GRAY_50: '#F1EFE8',
  GRAY_100: '#D3D1C7',
  GRAY_200: '#B4B2A9',
  GRAY_400: '#888780',
  GRAY_600: '#5F5E5A',
  GRAY_900: '#2C2C2A',
  BLUE: '#185FA5',
  BLUE_LT: '#E6F1FB',
  BLUE_MD: '#378ADD',
};

export const PLAN_CYCLE_INFO = "Your card will be charged monthly automatically. Total commitment is 12 months.";

export const SUBSCRIPTION_STATUS = {
  CREATED: 'created',       // Initialized, awaiting first payment
  AUTHENTICATED: 'authenticated', // Verified, waiting for first cycle charge
  ACTIVE: 'active',         // Live and current
  PENDING: 'pending',       // Payment failed, retrying
  HALTED: 'halted',         // All retries failed, suspended
  CANCELLED: 'cancelled',   // Terminated
  COMPLETED: 'completed',   // All billing cycles finished
  EXPIRED: 'expired',       // Validity period passed before starting
};
