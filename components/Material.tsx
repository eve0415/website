import { CardActionArea, Grid, Paper, SvgIcon, Zoom } from '@mui/material';
import Link from 'next/link';
import { useInView } from 'react-intersection-observer';
import type { LinkCard } from './constants';

export default function Material({
    name,
    url,
    svg,
    width,
    height,
}: LinkCard & {
    width: number;
    height: number;
}) {
    const { ref, inView } = useInView({ threshold: 0.8, triggerOnce: true });

    return (
        <Grid item ref={ref}>
            <Zoom in={inView}>
                <Paper sx={{ width: width, height: height }}>
                    <Link href={url} passHref>
                        <CardActionArea
                            target='_blank'
                            rel='noopener noreferrer'
                            href=''
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: width,
                                height: height,
                            }}
                        >
                            <SvgIcon viewBox='0 0 128 128' sx={{ fontSize: '70px' }}>
                                {svg}
                            </SvgIcon>
                            {name}
                        </CardActionArea>
                    </Link>
                </Paper>
            </Zoom>
        </Grid>
    );
}
