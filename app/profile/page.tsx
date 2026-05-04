import ProfileClient from "./ProfileClient";
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: "FamWallet-Profile"
}

export default function Profile() {
    return (
        <div>
            <ProfileClient />
        </div>
    )
}