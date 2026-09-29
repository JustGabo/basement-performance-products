import "server-only";

import { customerAccountRequest } from "./customer-account";

export type CustomerMoney = { amount: string; currencyCode: string };
export type CustomerOrder = {
  id: string;
  name: string;
  processedAt: string;
  financialStatus: string | null;
  fulfillmentStatus: string;
  statusPageUrl: string;
  totalPrice: CustomerMoney;
  lineItems: { nodes: Array<{ id: string; name: string; quantity: number; totalPrice: CustomerMoney | null }> };
};
export type ShopifyCustomer = {
  id: string;
  displayName: string;
  firstName: string | null;
  lastName: string | null;
  emailAddress: { emailAddress: string | null } | null;
  addresses: { nodes: Array<{ id: string; name: string | null; formatted: string[]; phoneNumber: string | null }> };
  orders: { nodes: CustomerOrder[] };
};

const CUSTOMER_QUERY = `#graphql
  query BasementCustomer($ordersFirst: Int!, $addressesFirst: Int!) {
    customer {
      id
      displayName
      firstName
      lastName
      emailAddress { emailAddress }
      addresses(first: $addressesFirst) { nodes { id name formatted phoneNumber } }
      orders(first: $ordersFirst, reverse: true) {
        nodes {
          id name processedAt financialStatus fulfillmentStatus statusPageUrl
          totalPrice { amount currencyCode }
          lineItems(first: 25) {
            nodes { id name quantity totalPrice { amount currencyCode } }
          }
        }
      }
    }
  }
`;

export async function getShopifyCustomer(options: { orders?: number; addresses?: number } = {}) {
  const data = await customerAccountRequest<{ customer: ShopifyCustomer }>(CUSTOMER_QUERY, {
    ordersFirst: options.orders ?? 10,
    addressesFirst: options.addresses ?? 10,
  });
  return data?.customer ?? null;
}

export function customerMoney(money: CustomerMoney, locale = "en-US") {
  return new Intl.NumberFormat(locale, { style: "currency", currency: money.currencyCode }).format(Number(money.amount));
}
