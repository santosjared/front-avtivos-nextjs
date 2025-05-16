export default () => ({
    backendURI: process.env.NEXT_PUBLIC_BACKEND_URI || 'http://localhost:3001',
    keyAes: process.env.NEXT_PUBLIC_BACKEND_KEY || 'my-key'

})