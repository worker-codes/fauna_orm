export type UserUpdateManyArgs = {
    data: UserUpdateManyMutationInput
    where?: UserWhereInput | null
}

export type BatchPayload = {
    count: number
}

export type FindManyUserArgs = {
    where?: UserWhereInput | null
    orderBy?: UserOrderByInput | null
    skip?: number | null
    after?: UserWhereUniqueInput | null
    before?: UserWhereUniqueInput | null
    first?: number | null
    last?: number | null
  }