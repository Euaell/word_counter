import type { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google"
import { Poppins } from 'next/font/google';
import "./globals.css";

const poppins = Poppins({
	weight: ['400', '700'],
	subsets: ['latin'],
});

export const metadata: Metadata = {
	title: "Word Counter Cloud",
	description: "A word counter cloud",
}

export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {
	return (
		<html lang="en">
			<body
				className={`${poppins.className} antialiased`}
			>
				{children}
				<GoogleAnalytics gaId="G-M7J30X3P4K" />
			</body>
		</html>
	)
}
