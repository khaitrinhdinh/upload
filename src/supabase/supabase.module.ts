import { Module } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  providers: [
    {
      provide: 'SUPABASE_CLIENT',
      useFactory: () => {
        return createClient(
          process.env.SUPABASE_URL || '',
          process.env.SUPABASE_SERVICE_ROLE_KEY || '',
        );
      },
    },
    SupabaseService,
  ],
  exports: ['SUPABASE_CLIENT'],
})
export class SupabaseModule {}
