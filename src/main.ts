import { bootstrapApplication } from '@angular/platform-browser';
import { register as registerSwiperElemenets } from 'swiper/element/bundle';

import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

registerSwiperElemenets();
bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
