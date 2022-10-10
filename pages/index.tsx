import { Box, NoSsr } from '@mui/material';
import BackImage from '../components/BackImage';
import { Main } from '../components/Content';
import { PreConnect } from '../components/CustomImageProxy';
import Home from '../components/Home';

export default function Head() {
    return (
        <>
            <PreConnect />
            <Box display='flow-root'>
                <NoSsr>
                    <BackImage />
                    <Box position='fixed' width='100vw' height='100vh' bgcolor='rgba(0,0,0,0.5)' />

                    <Main>
                        <Home />
                    </Main>
                </NoSsr>
            </Box>
        </>
    );
}
