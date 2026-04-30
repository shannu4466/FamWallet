import LoginClient from './LoginClient'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: "FamWallet-Login"
}

export default function Login() {
    return (
        <div>
            <LoginClient />
        </div>
    )
}