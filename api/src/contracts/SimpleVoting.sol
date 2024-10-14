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
        uint startTime;
        uint duration;
    }

    mapping(uint => Ballot) private _ballots;
    mapping(uint => mapping(uint => uint)) private _tally;
    mapping(uint => mapping(address => bool)) public hasVoted;

    function createBallot(
        string memory question_,
        string[] memory options_,
        uint startTime_,
        uint duration_
    ) external {
        require(options_.length >= 2, "Provide at minimum two options");
        _ballots[counter] = Ballot(question_, options_, startTime_, duration_);
        counter++;
    }

    function getBallotByIndex(
        uint _index
    ) external view returns (Ballot memory ballot) {
        ballot = _ballots[_index];
    }

    // function to vote
    function cast(uint ballotIndex_, uint optionIndex_) external {
        require(!hasVoted[ballotIndex_][msg.sender], "El usuario ya voto"); // new
        Ballot memory votacion = _ballots[ballotIndex_];
        require(
            block.timestamp >= votacion.startTime,
            "La votacion no ha iniciado"
        );
        require(
            block.timestamp < votacion.startTime + votacion.duration,
            "Esta votacion ya termino"
        );

        require(
            !hasVoted[ballotIndex_][msg.sender],
            "El usuario ya emitio su voto"
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
}
