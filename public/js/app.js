(async () => { 
    let repositories;
    let selectedRepository;

    const elBtnRunDeployment = document.querySelector('#btnRunDeployment');
    elBtnRunDeployment.addEventListener('click', (e) => e.preventDefault());

    const onClickRunDeployment = async (e) => {
        elBtnRunDeployment.classList.add('disabled');
        elBtnRunDeployment.removeEventListener('click', onClickRunDeployment);
        elBtnRunDeployment.innerHTML = '<div class="spinner-border spinner-border-sm"/>';

        const response = await fetch(`//localhost:3000/api/v1/repository/${selectedRepository.name}/deploy`, {
            method: 'POST',
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                branch: 'master',
            }),
        })
        .then(res => res.json())
        .then(data => {
            elBtnRunDeployment.innerHTML = 'Run Deployment';
            elBtnRunDeployment.classList.remove('disabled');
            elBtnRunDeployment.addEventListener('click', onClickRunDeployment);
        });
    };

    await fetch('//localhost:3000/api/v1/repository')
        .then(res => res.json())
        .then(data => {
            repositories = data.repositories;
            
            const elSelectRepository = document.querySelector('#selectRepository');

            for (const repository of data.repositories) {
                const elOption = document.createElement('option');
                elOption.value = repository;
                elOption.innerText = repository;
                elSelectRepository.appendChild(elOption);
            }
        });

    await fetch(`//localhost:3000/api/v1/repository/${repositories[0]}`)
        .then(res => res.json())
        .then(data => {
            selectedRepository = data;

            const elSelectBranch = document.querySelector('#selectBranch');

            for (const branch of data.branches) {
                const elOption = document.createElement('option');
                elOption.value = branch;
                elOption.innerText = branch;
                elSelectBranch.appendChild(elOption);
            }
        });

    elBtnRunDeployment.classList.remove('disabled');
    elBtnRunDeployment.addEventListener('click', onClickRunDeployment);
})();
