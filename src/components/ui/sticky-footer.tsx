"use client";

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { motion, useReducedMotion } from 'motion/react';
import {
    TwitterLogoIcon,
    GitHubLogoIcon,
    InstagramLogoIcon,
    LinkedInLogoIcon,
    VideoIcon,
} from '@radix-ui/react-icons';
import { Button } from './Button';
import { TextHoverEffect } from './text-hover-effect';


interface FooterLink {
    title: string;
    href: string;
    icon?: React.ComponentType<{ className?: string }>;
}
interface FooterLinkGroup {
    label: string;
    links: FooterLink[];
}

type StickyFooterProps = React.ComponentProps<'footer'>;

export function StickyFooter({ className, ...props }: StickyFooterProps) {
    return (
        <footer
            className={cn('relative h-[720px] w-full', className)}
            style={{ clipPath: 'polygon(0% 0, 100% 0%, 100% 100%, 0 100%)' }}
            {...props}
        >
            <div className="fixed bottom-0 h-[720px] w-full">
                <div className="sticky top-[calc(100vh-720px)] h-full overflow-y-auto">
                    <div className="relative flex size-full flex-col justify-between gap-5 border-t border-border bg-background px-4 py-8 md:px-12">

                        <div
                            aria-hidden
                            className="absolute inset-0 isolate z-0 contain-strict pointer-events-none"
                        >
                            <div className="bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,var(--tw-gradient-from)_0,transparent_50%,transparent_100%)] from-primary/20 absolute top-0 left-0 h-320 w-140 -translate-y-87.5 -rotate-45 rounded-full" />
                            <div className="bg-[radial-gradient(50%_50%_at_50%_50%,var(--tw-gradient-from)_0,transparent_100%)] from-primary/10 absolute top-0 left-0 h-320 w-60 [translate:5%_-50%] -rotate-45 rounded-full" />
                            <div className="bg-[radial-gradient(50%_50%_at_50%_50%,var(--tw-gradient-from)_0,transparent_100%)] from-primary/10 absolute top-0 left-0 h-320 w-60 -translate-y-87.5 -rotate-45 rounded-full" />
                        </div>

                        {/* Upper Part - GHOSTFOUNDER Text Effect with Logo */}
                        <div className="w-full flex flex-col items-center justify-center relative z-10 pt-4">
                            <TextHoverEffect
                                text="GHOSTFOUNDER"
                                containerHeight="10rem"
                                viewBox="0 0 500 100"
                            />
                            {/* <Image
                                src="/ghostfounder.png"
                                alt="GhostFounder Logo"
                                width={80}
                                height={80}
                                className="rounded-2xl shadow-2xl shadow-violet-500/20 -mt-4"
                            /> */}
                        </div>

                        {/* Lower Part - All Content: Logo, Description, Links */}
                        <div className="flex flex-col gap-8 md:flex-row relative z-10">
                            <AnimatedContainer className="w-full max-w-sm min-w-2xs space-y-4">
                                <div className="flex items-center gap-2">
                                    <Image
                                        src="/ghostfounder.png"
                                        alt="GhostFounder Logo"
                                        width={160}
                                        height={160}
                                        className="rounded-lg"
                                    />
                                    <span className="text-xl font-bold">GhostFounder</span>
                                </div>
                                <p className="text-muted-foreground text-sm">
                                    Building the future of digital experiences, one pixel at a time.
                                    AI-powered platform for startups.
                                </p>
                                <div className="flex gap-2">
                                    {socialLinks.map((link) => (
                                        <Button key={link.title} size="icon" variant="outline" className="size-8" asChild>
                                            <a href={link.href} target="_blank" rel="noopener noreferrer">
                                                <link.icon className="size-4" />
                                            </a>
                                        </Button>
                                    ))}
                                </div>
                            </AnimatedContainer>
                            {footerLinkGroups.map((group, index) => (
                                <AnimatedContainer
                                    key={group.label}
                                    delay={0.1 + index * 0.1}
                                    className="w-full"
                                >
                                    <div className="mb-10 md:mb-0">
                                        <h3 className="text-sm uppercase font-semibold text-foreground">{group.label}</h3>
                                        <ul className="text-muted-foreground mt-4 space-y-2 text-sm md:text-xs lg:text-sm">
                                            {group.links.map((link) => (
                                                <li key={link.title}>
                                                    <a
                                                        href={link.href}
                                                        className="hover:text-primary inline-flex items-center transition-all duration-300"
                                                    >
                                                        {link.icon && <link.icon className="me-1 size-4" />}
                                                        {link.title}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </AnimatedContainer>
                            ))}
                        </div>

                        {/* Copyright Footer */}
                        <div className="text-muted-foreground flex flex-col items-center justify-between gap-2 border-t border-border pt-4 text-sm md:flex-row relative z-10">
                            <p>© {new Date().getFullYear()} GhostFounder. All rights reserved.</p>
                            <p>Developed by Anurag Mishra</p>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

const socialLinks = [
    { title: 'Twitter', href: '#', icon: TwitterLogoIcon },
    { title: 'Github', href: '#', icon: GitHubLogoIcon },
    { title: 'Instagram', href: '#', icon: InstagramLogoIcon },
    { title: 'LinkedIn', href: '#', icon: LinkedInLogoIcon },
    { title: 'Youtube', href: '#', icon: VideoIcon },
];

const footerLinkGroups: FooterLinkGroup[] = [
    {
        label: 'Product',
        links: [
            { title: 'Features', href: '#' },
            { title: 'Pricing', href: '#' },
            { title: 'Documentation', href: '#' },
            { title: 'API', href: '#' },
            { title: 'Integrations', href: '#' },
        ],
    },
    {
        label: 'Company',
        links: [
            { title: 'About Us', href: '#' },
            { title: 'Careers', href: '#' },
            { title: 'Blog', href: '#' },
            { title: 'Contact', href: '#' },
            { title: 'Brand Assets', href: '#' },
        ],
    },
    {
        label: 'Resources',
        links: [
            { title: 'Community', href: '#' },
            { title: 'Help Center', href: '#' },
            { title: 'Status', href: '#' },
            { title: 'Terms of Service', href: '#' },
            { title: 'Privacy Policy', href: '#' },
        ],
    },
];

type AnimatedContainerProps = React.ComponentProps<typeof motion.div> & {
    children?: React.ReactNode;
    delay?: number;
};

function AnimatedContainer({
    delay = 0.1,
    children,
    ...props
}: AnimatedContainerProps) {
    const shouldReduceMotion = useReducedMotion();

    if (shouldReduceMotion) {
        return <div {...(props as React.HTMLAttributes<HTMLDivElement>)}>{children}</div>;
    }

    return (
        <motion.div
            initial={{ filter: 'blur(4px)', translateY: -8, opacity: 0 }}
            whileInView={{ filter: 'blur(0px)', translateY: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay, duration: 0.8 }}
            {...props}
        >
            {children}
        </motion.div>
    );
}

export default StickyFooter;
