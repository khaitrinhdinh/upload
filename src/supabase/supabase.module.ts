import { Module } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';

@Module({
  providers: [
    {
      provide: 'SUPABASE_CLIENT',
      useFactory: () => {
        return createClient(
          "https://wqhgosemqqgumisvgoej.supabase.co",
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndxaGdvc2VtcXFndW1pc3Znb2VqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDgzNjc2NiwiZXhwIjoyMDY2NDEyNzY2fQ.sObph20W-uHx_I_ZFbK5R-mkQQK-hKh4OMJy5A-w6og",
        );
      },
    },
    SupabaseService,
  ],
  exports: ['SUPABASE_CLIENT'],
})
export class SupabaseModule {}
