import { createClient } from "@/lib/supabase/client";

export type SignUpInput = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  marketingOptIn: boolean;
};

export interface CustomerAuthClient {
  signIn(email: string, password: string): Promise<void>;
  signUp(input: SignUpInput): Promise<{ hasSession: boolean }>;
}

class SupabaseCustomerAuthClient implements CustomerAuthClient {
  async signIn(email: string, password: string) {
    const { error } = await createClient().auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

  async signUp(input: SignUpInput) {
    const { data, error } = await createClient().auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: {
          first_name: input.firstName,
          last_name: input.lastName,
          marketing_opt_in: input.marketingOptIn,
        },
      },
    });
    if (error) throw error;
    return { hasSession: Boolean(data.session) };
  }
}

export function getCustomerAuthClient(): CustomerAuthClient {
  return new SupabaseCustomerAuthClient();
}
