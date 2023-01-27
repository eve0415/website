import { Button, Flex, Grid, Paper, Text } from '@mantine/core';
import Link from 'next/link';
import { useInView } from 'react-intersection-observer';
import { CSSTransition } from 'react-transition-group';
import ripplet from 'ripplet.js';
import type { LinkCard } from '../me';

export const Material = ({
  name,
  url,
  svg,
  width,
  height,
}: LinkCard & {
  width: number;
  height: number;
}) => {
  const { ref, inView } = useInView({ threshold: 0.25, triggerOnce: true });

  return (
    <CSSTransition in={inView} timeout={300} classNames='material'>
      <Grid.Col m={5} span='content' ref={ref} className='material-cols'>
        <Paper shadow='md' w={width} h={height} radius='sm'>
          <Button
            component={Link}
            href={url}
            w={width}
            h={height}
            p={0}
            variant='white'
            target='_blank'
            rel='noopener noreferrer'
            sx={theme => ({
              textDecoration: 'none',
              color: 'black',
              transitionDuration: '500ms',
              '&:hover': {
                backgroundColor: theme.fn.darken('#fff', 0.05),
              },
            })}
            onPointerDown={event => ripplet(event, { clearing: false })}
            onPointerUp={() => ripplet.clear()}
            onPointerLeave={() => ripplet.clear()}
          >
            <Flex direction='column' align='center'>
              <svg style={{ width: 70, height: 70 }} viewBox='0 0 128 128'>
                {svg}
              </svg>
              <Text>{name}</Text>
            </Flex>
          </Button>
        </Paper>
      </Grid.Col>
    </CSSTransition>
  );
};
