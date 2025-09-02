    import './globals.css';
    import { Providers } from './providers';

    export const metadata = {
      title: 'VibeFinder',
      description: 'Stop doomscrolling, start discovering: Your AI guide to trending local spots.',
    };

    export default function RootLayout({ children }) {
      return (
        <html lang="en">
          <body>
            <Providers>{children}</Providers>
          </body>
        </html>
      );
    }
  