import ReportsClient from './ReportsClient'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: "FamWallet-Reports"
}

export default function Login() {
    return (
        <div>
            <ReportsClient />
        </div>
    )
}