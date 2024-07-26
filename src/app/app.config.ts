import {
  ApplicationConfig,
  importProvidersFrom,
  provideZoneChangeDetection,
} from '@angular/core';
import { ArrowRight, ArrowRightCircle, Download } from 'angular-feather/icons';
import { FeatherModule } from 'angular-feather';

const icons = {
  Download,
  ArrowRight,
  ArrowRightCircle
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    importProvidersFrom(FeatherModule.pick(icons)),
  ],
};
