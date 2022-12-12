import { Box, Flex, MediaQuery, Overlay, Text, Title } from '@mantine/core';
import { Main } from '../components/Content';
import { CustomImageProxy, PreConnect } from '../components/CustomImageProxy';
import { horizontalPicture, profilePicture, verticalPicture } from '../components/StaticUrl';

export default function Head() {
    return (
        <div>
            <PreConnect />

            <MediaQuery smallerThan='sm' styles={{ display: 'none' }}>
                <CustomImageProxy src={verticalPicture} alt='My Cat' fill />
            </MediaQuery>
            <MediaQuery largerThan='sm' styles={{ display: 'none' }}>
                <CustomImageProxy src={horizontalPicture} alt='My Cat' fill />
            </MediaQuery>

            <Overlay zIndex={0} blur={5} sx={{ backgroundColor: 'rgba(0,0,0,0.4)' }} />

            <Main margin={0}>
                <Flex direction='column' align='center' justify='center' h='100dvh' sx={{ color: 'white' }}>
                    <Box
                        w={{ base: 100, md: 200, lg: 300 }}
                        h={{ base: 100, md: 200, lg: 300 }}
                        sx={{ borderRadius: '50%', overflow: 'hidden' }}
                        pos='relative'
                    >
                        <CustomImageProxy
                            src={profilePicture}
                            alt='My profile picture'
                            // sizes='(min-width: 1200px) 300px, (min-width: 900px) 200px, 100px'
                            fill
                            // priority
                        />
                    </Box>

                    <Title size='3rem' pt='32px'>
                        eve0415
                    </Title>
                    <Text fz='xl'>ただの大学生</Text>
                    <Text fz='xl'>いつも眠たい人</Text>
                </Flex>
            </Main>
        </div>
    );
}
