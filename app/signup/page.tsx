import SignupClient from './SignupClient'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: "FamWallet-Signup"
}

export default function Login() {
    return (
        <div>
            <SignupClient />
        </div>
    )
}