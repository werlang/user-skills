class ProfileCard {
    constructor(user) {
        this.user = user;
        this.element = document.createElement('article');
        this.element.className = 'profile-card';
        this.render();
    }

    render() {
        this.element.innerHTML = `
            <h2>${this.user.name || 'Unnamed user'}</h2>
            <p>${this.user.email || 'No email'}</p>
        `;
        return this;
    }

    get() {
        return this.element;
    }
}

export { ProfileCard };