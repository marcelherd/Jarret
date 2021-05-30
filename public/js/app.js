(async () => { 
    let repositories;
    let selectedRepository;

    const elBtnRunDeployment = document.querySelector('#btnRunDeployment');
    elBtnRunDeployment.addEventListener('click', (e) => e.preventDefault());

    const elTblHistory = document.querySelector('#tblHistory');
    const elSpinnerHistory = document.querySelector('#spinnerHistory');
    const elSelectType = document.querySelector('#selectType');
    const elSelectBranch = document.querySelector('#selectBranch');
    const elSelectBranchLabel = document.querySelector('#selectBranchLabel');
    const elDeploymentAlert = document.querySelector('#deploymentAlert');
    const elDeploymentAlertText = document.querySelector('#deploymentAlertText');

    const rollbackTo = async (build) => {
        elBtnRunDeployment.classList.add('disabled');
        elBtnRunDeployment.removeEventListener('click', onClickRunDeployment);
        elBtnRunDeployment.textContent = 'Deployment in progress';

        elSpinnerHistory.classList.remove('d-none');
        elTblHistory.classList.add('d-none');

        const response = await fetch(`//localhost:3000/api/v1/repository/${selectedRepository.name}/deploy`, {
            method: 'POST',
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                branch: build.branch,
                commit: build.commit,
            }),
        })
        .then(res => res.json())
        .then(data => {
            elBtnRunDeployment.innerHTML = 'Run Deployment';
            elBtnRunDeployment.classList.remove('disabled');
            elBtnRunDeployment.addEventListener('click', onClickRunDeployment);
            
            selectedRepository = data.repository;
            updateHistory();

            const version = selectedRepository.builds[0].version;
            elDeploymentAlertText.innerHTML = `Successfully deployed release <a class="alert-link">${version}</a>.`;
            elDeploymentAlert.classList.remove('d-none');
        });
    };

    const updateHistory = () => {
        const elTableBody = document.querySelector('#tblHistoryBody');
        elTableBody.innerHTML = '';

        let firstBuild = true;
        for (const build of selectedRepository.builds) {
            const elRow = document.createElement('tr');

            const elStatus = document.createElement('td');
            elStatus.textContent = build.result;
            elStatus.classList.add('align-middle');
            if (build.result === 'Success') elStatus.classList.add('table-success');
            elRow.appendChild(elStatus);

            const elVersion = document.createElement('td');
            elVersion.textContent = build.version;
            elVersion.classList.add('align-middle');
            elRow.appendChild(elVersion);

            const elBranch = document.createElement('td');
            elBranch.textContent = build.branch;
            elBranch.classList.add('align-middle');
            elRow.appendChild(elBranch);

            const elStartedAt = document.createElement('td');
            elStartedAt.textContent = new Date(build.started_at).toUTCString();
            elStartedAt.classList.add('align-middle');
            elRow.appendChild(elStartedAt);

            const elFinishedAt = document.createElement('td');
            elFinishedAt.textContent = new Date(build.finished_at).toUTCString();
            elFinishedAt.classList.add('align-middle');
            elRow.appendChild(elFinishedAt);

            const elActions = document.createElement('td');
            if (firstBuild) {
                elActions.textContent = 'Current Version';
            } else {
                const elBtnRollback = document.createElement('button');
                elBtnRollback.type = 'button';
                elBtnRollback.classList.add('btn', 'btn-danger', 'btn-block', 'm-0');
                elBtnRollback.textContent = 'Rollback';
                elBtnRollback.addEventListener('click', async (e) => await rollbackTo(build));
                elActions.appendChild(elBtnRollback);
            }
            elRow.appendChild(elActions);

            elTableBody.appendChild(elRow);

            firstBuild = false;
        }

        elTblHistory.classList.remove('d-none');
        elSpinnerHistory.classList.add('d-none');
    };

    const onChangeType = (e) => {
        if (selectType.value === 'New Release') {
            elSelectBranchLabel.textContent = 'Branch';
            elSelectBranch.innerHTML = '';

            for (const branch of selectedRepository.branches) {
                const elOption = document.createElement('option');
                elOption.value = branch;
                elOption.innerText = branch;
                elSelectBranch.appendChild(elOption);
            }
        } else {
            elSelectBranchLabel.textContent = 'Release';
            elSelectBranch.innerHTML = '';

            const releases = new Set();
            for (const build of selectedRepository.builds) {
                releases.add(build.version);
            }
            for (const release of releases) {
                const elOption = document.createElement('option');
                elOption.value = release;
                elOption.innerText = release;
                elSelectBranch.appendChild(elOption);
            }
        }
    };

    const onClickRunDeployment = async (e) => {
        elBtnRunDeployment.classList.add('disabled');
        elBtnRunDeployment.removeEventListener('click', onClickRunDeployment);
        elBtnRunDeployment.textContent = 'Deployment in progress';

        elSpinnerHistory.classList.remove('d-none');
        elTblHistory.classList.add('d-none');

        let branch;
        let commit;
        let release;

        if (elSelectType.value === 'New Release') {
            branch = elSelectBranch.value;
        } else {
            release = elSelectBranch.value;
            const build = selectedRepository.builds.filter(b => b.version === release)[0];
            branch = build.branch;
            commit = build.commit;
        }

        if (branch.startsWith('origin')) branch = branch.replace('origin/', '');

        const response = await fetch(`//localhost:3000/api/v1/repository/${selectedRepository.name}/deploy`, {
            method: 'POST',
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                branch,
                ...(commit && { commit }),
                ...(release && { release }),
            }),
        })
        .then(res => res.json())
        .then(data => {
            elBtnRunDeployment.innerHTML = 'Run Deployment';
            elBtnRunDeployment.classList.remove('disabled');
            elBtnRunDeployment.addEventListener('click', onClickRunDeployment);
            
            selectedRepository = data.repository;
            updateHistory();

            const version = selectedRepository.builds[0].version;
            elDeploymentAlertText.innerHTML = `Successfully deployed release <a class="alert-link">${version}</a>.`;
            elDeploymentAlert.classList.remove('d-none');
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

            for (const branch of data.branches) {
                const elOption = document.createElement('option');
                elOption.value = branch;
                elOption.innerText = branch;
                elSelectBranch.appendChild(elOption);
            }
        });

    elBtnRunDeployment.classList.remove('disabled');
    elBtnRunDeployment.addEventListener('click', onClickRunDeployment);

    updateHistory();

    elSelectType.addEventListener('change', onChangeType);
    elSelectType.disabled = false;
})();
