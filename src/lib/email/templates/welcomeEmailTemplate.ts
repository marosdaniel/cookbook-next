import { env } from '@/env';
import {
  emailButton,
  emailContent,
  emailFooter,
  emailHeader,
  emailLayout,
  emailList,
  emailParagraph,
} from './shared/emailComponents';

export const welcomeEmailTemplate = (userName: string) => {
  const content = `
    ${emailHeader('Welcome to Cookbook! 🎉')}
    
    ${emailContent(`
      ${emailParagraph(`Hello <strong>${userName}</strong>,`)}
      
      ${emailParagraph("Thank you for joining Cookbook! We're excited to have you as part of our culinary community.")}
      
      ${emailParagraph('You can now:')}
      
      ${emailList([
        'Browse and save your favorite recipes',
        'Create and share your own recipes',
        'Connect with other food enthusiasts',
        'Organize your personal cookbook',
      ])}
      
      ${emailParagraph('Start exploring delicious recipes now!', '30px')}
      
      <div style="text-align: center;">
        ${emailButton('Explore Recipes', env.NEXTAUTH_URL || 'http://localhost:3000')}
      </div>
    `)}
    
    ${emailFooter('Happy cooking! 👨‍🍳👩‍🍳', "If you didn't create this account, please ignore this email.")}
  `;

  const html = emailLayout(content);

  const text = `
Welcome to Cookbook! 🎉

Hello ${userName},

Thank you for joining Cookbook! We're excited to have you as part of our culinary community.

You can now:
- Browse and save your favorite recipes
- Create and share your own recipes
- Connect with other food enthusiasts
- Organize your personal cookbook

Start exploring delicious recipes now!

Visit: ${env.NEXTAUTH_URL || 'http://localhost:3000'}

Happy cooking! 👨‍🍳👩‍🍳

If you didn't create this account, please ignore this email.
  `;

  return { html, text };
};
