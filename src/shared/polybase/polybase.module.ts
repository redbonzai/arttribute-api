import { Global, Module } from '@nestjs/common';
import { PolybaseService } from './polybase.service';

@Global()
@Module({
  controllers: [],
  providers: [PolybaseService],
  exports: [PolybaseService],
})
export class PolybaseModule {}
