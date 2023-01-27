import { Box, Button, Text, useMantineTheme } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import type { NavbarOperation } from './Interface';
import { pages } from './pages';
import ripplet from 'ripplet.js';

const NavbarBig = dynamic(() => import('./NavbarBig'), { ssr: false });
const NavbarSmall = dynamic(() => import('./NavbarSmall'), { ssr: false });

export const Navbar = ({ isOpen, open, close }: NavbarOperation) => {
  const router = useRouter();

  useEffect(() => {
    if (isOpen) close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.pathname]);

  const content = (
    <>
      {pages.map(({ title, icon, href }) => (
        <Button
          component={Link}
          key={title}
          href={href}
          h={60}
          w='75%'
          my={8}
          mx={16}
          radius='sm'
          variant={router.pathname === href ? 'light' : 'subtle'}
          leftIcon={
            <Box
              sx={theme => ({
                fontSize: 30,
                [`@media (min-width: ${theme.breakpoints.lg}px)`]: { fontSize: 25 },
              })}
            >
              {icon}
            </Box>
          }
          sx={{
            color: router.pathname === href ? 'blueviolet' : 'inherit',
            display: 'flex',
            justifyContent: 'left',
          }}
          onPointerDown={event => ripplet(event, { clearing: false })}
          onPointerUp={() => ripplet.clear()}
          onPointerLeave={() => ripplet.clear()}
        >
          <Text
            sx={theme => ({
              fontWeight: 400,
              fontSize: 20,
              [`@media (min-width: ${theme.breakpoints.lg}px)`]: { fontSize: 25 },
            })}
          >
            {title}
          </Text>
        </Button>
      ))}
    </>
  );

  return useMediaQuery(`(min-width: ${useMantineTheme().breakpoints.md}px)`) ? (
    <NavbarBig>{content}</NavbarBig>
  ) : (
    <NavbarSmall isOpen={isOpen} open={open} close={close}>
      {content}
    </NavbarSmall>
  );
};
