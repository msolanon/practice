// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleVoting {
    // counter enables us to use a mapping
    // instead of an array for the ballots
    // this is more gas effiecient
    uint public counter = 0;

    // the structure of a ballot object
    struct Ballot {
        string question;
        string[] options;
        uint256 startTime;
        uint256 endTime;
    }

    mapping(uint => Ballot) private _ballots;
    mapping(uint => mapping(uint => uint)) private _tally;
    mapping(uint => mapping(address => bool)) public hasVoted;

    function createBallot(
        string memory question_,
        string[] memory options_,
        uint startTime_,
        uint endTime_
    ) external {
        require(options_.length >= 2, "Seleccione al menos 2 candidatos");
        _ballots[counter] = Ballot(question_, options_, startTime_, endTime_);
        counter++;
    }

    function getBallotByIndex(
        uint _index
    ) external view returns (Ballot memory ballot) {
        ballot = _ballots[_index];
    }

    function getCounter() external view returns (uint) {
        return counter;
    }

    // function to vote
    function cast(uint ballotIndex_, uint optionIndex_) external {
        require(
            !hasVoted[ballotIndex_][msg.sender],
            "___El usuario ya voto___"
        ); // new
        Ballot memory votacion = _ballots[ballotIndex_];

        uint currentDate = block.timestamp;

        require(
            currentDate >= votacion.startTime,
            "___La votacion no ha iniciado___"
        );

        require(
            currentDate <= votacion.endTime,
            "___Esta votacion ya termino___"
        );
        _tally[ballotIndex_][optionIndex_]++;
        hasVoted[ballotIndex_][msg.sender] = true;
    }

    function getTally(
        uint ballotIndex_,
        uint optionIndex_
    ) external view returns (uint) {
        return _tally[ballotIndex_][optionIndex_];
    }

    function results(uint ballotIndex_) external view returns (uint[] memory) {
        Ballot memory ballot = _ballots[ballotIndex_];
        uint len = ballot.options.length;
        uint[] memory result = new uint[](len);
        for (uint i = 0; i < len; i++) {
            result[i] = _tally[ballotIndex_][i];
        }
        return result;
    }

    function winners(uint ballotIndex_) external view returns (bool[] memory) {
        Ballot memory ballot = _ballots[ballotIndex_];
        uint len = ballot.options.length;
        uint[] memory result = new uint[](len);
        uint max;
        for (uint i = 0; i < len; i++) {
            result[i] = _tally[ballotIndex_][i];
            if (result[i] > max) {
                max = result[i];
            }
        }
        bool[] memory winner = new bool[](len);
        for (uint i = 0; i < len; i++) {
            if (result[i] == max) {
                winner[i] = true;
            }
        }
        return winner;
    }

    function winnersWithLimit(
        uint ballotIndex_,
        uint limit_
    ) external view returns (bool[] memory) {
        Ballot memory ballot = _ballots[ballotIndex_];
        uint len = ballot.options.length;
        require(limit_ > 0 && limit_ <= len, "Limite invalido");

        uint[] memory votes = new uint[](len);
        // 1. Obtener conteos de votos
        for (uint i = 0; i < len; i++) {
            votes[i] = _tally[ballotIndex_][i];
        }

        // 2. Copiar y ordenar los conteos para encontrar el umbral de votos
        // Solidity no tiene funciones de ordenamiento nativas para arrays dinámicos en storage,
        // así que usamos un algoritmo de ordenamiento simple (Bubble Sort) en memoria.
        uint[] memory sortedVotes = new uint[](len);
        for (uint i = 0; i < len; i++) {
            sortedVotes[i] = votes[i];
        }

        for (uint i = 0; i < len; i++) {
            for (uint j = i + 1; j < len; j++) {
                if (sortedVotes[i] < sortedVotes[j]) {
                    uint temp = sortedVotes[i];
                    sortedVotes[i] = sortedVotes[j];
                    sortedVotes[j] = temp;
                }
            }
        }

        // 3. Determinar el umbral de votos para la posición límite (limit_ - 1, ya que es 0-indexado)
        uint thresholdVoteCount = sortedVotes[limit_ - 1];

        // 4. Verificar si hay empate en el umbral
        bool isTieAtThreshold = false;
        // Si limit_ es menor que la longitud total, comprobamos el siguiente elemento
        if (limit_ < len) {
            if (thresholdVoteCount == sortedVotes[limit_]) {
                isTieAtThreshold = true;
            }
        }

        // 5. Asignar ganadores:
        // Si hay empate en el umbral, solo ganan aquellos con estrictamente más votos que el umbral.
        // Si no hay empate, ganan aquellos con votos mayores o iguales al umbral.
        bool[] memory winner = new bool[](len);
        for (uint i = 0; i < len; i++) {
            if (isTieAtThreshold) {
                if (votes[i] > thresholdVoteCount) {
                    winner[i] = true;
                }
            } else {
                // Caso sin empate: si los votos son >= al umbral, son ganadores.
                // Esto también cubre el caso en que limit_ es igual a len.
                if (votes[i] >= thresholdVoteCount) {
                    winner[i] = true;
                }
            }
        }

        return winner;
    }
}
