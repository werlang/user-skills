import { ProfileCard } from './components/profile-card.js';
import { TemplateVar } from './helpers/template-var.js';
import { UserModel } from './models/user.js';

async function bootstrapHomePage() {
    const root = document.querySelector('[data-home-root]');
    if (!root) {
        return;
    }

    root.dataset.pageName = TemplateVar.get('pageName') || 'home';

    const user = UserModel.fromStorage();
    if (!user.token) {
        root.textContent = 'No authenticated user in LocalData.';
        return;
    }

    await user.getCurrent();
    root.appendChild(new ProfileCard(user).get());
}

bootstrapHomePage().catch(error => {
    console.error(error);
});

export { bootstrapHomePage };