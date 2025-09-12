import { Box, Button, Flex, HStack, Text } from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'

export function Header() {
	return (
		<Box px={4} py={3} borderBottom='1px'>
			<Flex h={16} alignItems='center' justifyContent='space-between'>
				<HStack alignItems='center'>
					<Text fontSize='xl' fontWeight='bold'>
						JobsApp
					</Text>
					<HStack as='nav' display={{ base: 'none', md: 'flex' }}>
						<Button variant='ghost' as={RouterLink}>
							Вакансии
						</Button>
						<Button variant='ghost'>Дашборд</Button>
					</HStack>
				</HStack>
			</Flex>
		</Box>
	)
}
