(async () => { 
    let repositories;
    let selectedRepository;

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

    const elBtnRunDeployment = document.querySelector('#btnRunDeployment');
    elBtnRunDeployment.classList.remove('disabled');
})();
