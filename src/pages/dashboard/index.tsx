
const DashBoard = () => {
    return <div>DashBoard</div>
}

DashBoard.acl = {
    action: 'read',
    subject: 'dashboard'
}

DashBoard.authGuard = true;
export default DashBoard