export type ResourceKey =
  | 'recipientDomains' | 'sendingIps' | 'ipPools' | 'campaigns'
  | 'mailboxProviders' | 'mailboxProviderRegions' | 'sendingDomains' | 'subaccounts';

export interface ResourceFilters {
  recipientDomains: string[];
  sendingIps: string[];
  ipPools: string[];
  campaigns: string[];
  mailboxProviders: string[];
  mailboxProviderRegions: string[];
  sendingDomains: string[];
  subaccounts: string[];
}

export const EMPTY_FILTERS: ResourceFilters = {
  recipientDomains: [], sendingIps: [], ipPools: [], campaigns: [],
  mailboxProviders: [], mailboxProviderRegions: [], sendingDomains: [], subaccounts: [],
};
