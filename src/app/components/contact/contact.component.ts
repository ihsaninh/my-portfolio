import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SocialComponent } from '../home/social/social.component';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [SocialComponent, ReactiveFormsModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss',
})
export class ContactComponent {
  formBuilder = inject(FormBuilder);
  contactForm = this.formBuilder.group({
    name: ['', Validators.required],
    email: ['', Validators.required],
    message: ['', Validators.required],
  });

  onSubmit() {
    if (this.contactForm.valid) {
      const { name, email, message } = this.contactForm.value;
      const mailtoURL = `mailto:ihsan.inh@gmail.com?subject=Message from ${name} - ${email}&body=${message}`;
      window.location.href = mailtoURL;

      this.contactForm.reset();
    }
  }
}
