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
}
