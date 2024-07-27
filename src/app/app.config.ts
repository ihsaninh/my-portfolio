import {
  ApplicationConfig,
  importProvidersFrom,
  provideZoneChangeDetection,
} from '@angular/core';
import { ArrowUpRight, Download } from 'angular-feather/icons';
import { FeatherModule } from 'angular-feather';

const icons = {
  Download,
  ArrowUpRight,
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    importProvidersFrom(FeatherModule.pick(icons)),
  ],
};
