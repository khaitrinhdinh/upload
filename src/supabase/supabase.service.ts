import { Injectable, Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  constructor(
    @Inject('SUPABASE_CLIENT') private readonly supabase: SupabaseClient,
  ) {}

  async insertData(table: string, data: any) {
    const { data: insertedData, error } = await this.supabase
      .from(table)
      .insert(data)
      .select();

    if (error) {
      console.error('Supabase insert error:', error);
      throw new Error(`Error inserting data: ${JSON.stringify(error)}`);
    }
    return insertedData;    
  }

  async deleteData(table: string, key: string, value: any) {
    const { data, error } = await this.supabase
      .from(table)
      .delete()
      .eq(key, value);

    if (error) {
      console.error('Supabase delete error:', error);
      throw new Error(`Error deleting data: ${JSON.stringify(error)}`);
    }
    return data;
  }
}
